import dotenv from "dotenv";
dotenv.config();

import { transpile } from "typescript";
import OpenAI from 'openai';

import openAiAuditor, { chatCompletionModel } from "../services/OpenAIAuditor";

import { Step } from "../types/Step";
import { stepExecutorFunction, stepExecutorMapping } from "./stepExecutionUtils";
import { stepTypeToString } from "./typeStringifyUtils";
import { loadBasicStepDefs, saveAICode } from "./fileUtils";
import { devLog } from "./logging";

const openai = new OpenAI(); // Loads api key from OPENAI_API_KEY env variable

type messageAndResponse = [string, string];

export const formatPromptToGenerateStep = (
    stepName: string,
    typeDefinition: string,
    example: string | Step
): string => {
    if (typeof example !== 'string') {
        example = JSON.stringify(example, null, 4);
    }
    return `
Given the example:
\n\`${example}\`
\nAnd the type definition:\n\`${typeDefinition}\`
\nCode a typescript function that executes the ${stepName} step.
`
}

export const generateHistoryFromBasicSteps = (): messageAndResponse[] => {
    const messages: messageAndResponse[] = [];

    for (const [stepName, example, typeDef, executorCode] of loadBasicStepDefs()) {
        const userMessage = formatPromptToGenerateStep(stepName, typeDef, example);
        const response = executorCode;
        messages.push([userMessage, response]);
    }

    return messages;
}

export const chatCompletionCall = async (
    userPrompt: string,
    previousMessages: messageAndResponse[],
    sysPrompt?: string,
    model: chatCompletionModel = process.env.CHAT_COMPLETION_MODEL as chatCompletionModel || 'gpt-3.5-turbo'
): Promise<string> => {
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (sysPrompt) {
        messages.push({ role: 'system', content: sysPrompt });
    }

    for (const [message, response] of previousMessages) {
        messages.push({ role: 'user', content: message });
        messages.push({ role: 'assistant', content: response });
    }

    messages.push({ role: 'user', content: userPrompt });

    const chatCompletion = await openai.chat.completions.create({
        messages,
        model
    });

    openAiAuditor.audit(chatCompletion);

    const response: string = chatCompletion.choices[0].message.content || '';

    return response;
}

const SYS_PROMPT = `
You are not a conversational AI, instead you are a typescript function generator as part of a workflow automation tool.
You are given an example of a step and a type definition for that step. 
Your output is a typescript function that serves as an executor for an arbitrary step of that type.
The function is named 'execute' and takes a step as an argument.
The function must return a promise that resolves to a StepOutput.
Your output code will be executed directly, so it must consist entirely of valid typescript code. Any extraneous output must be in a comment.
`

const tryGenerateCode = async (
    step: Step,
    userPrompt: string = '',
    previousMessages: messageAndResponse[] = []
): Promise<[string, string, stepExecutorFunction]> => {
    const generatedCode = await chatCompletionCall(userPrompt, previousMessages, SYS_PROMPT);

    devLog(`Generated code: ${generatedCode}`);

    const jsCode = transpile(generatedCode);
    const executor = eval(`${jsCode}; execute;`);

    // FUTURE: Could generate a test for the executor and run it here

    devLog(`Generated executor: ${executor}, Executing ${JSON.stringify(step, null, 4)}`);

    const result = await executor(step);
    if (result === undefined) {
        throw new Error('Executed function did not return.');
    }

    return [jsCode, generatedCode, executor];
}

export const tryGenerateWorkingStepExecutorWithAI = async (
    step: Step,
    tries: number = 3,
    saveWorkingCode: boolean = true
): Promise<stepExecutorFunction> => {
    const key = Object.keys(step)[0];

    const typeDefinition = stepTypeToString(step);

    const previousMessages = generateHistoryFromBasicSteps();
    const userPrompt = formatPromptToGenerateStep(key, typeDefinition, step);

    let success = false;
    while (!success && tries > 0) {
        try {
            const [jsCode, tsCode, executor] = await tryGenerateCode(step, userPrompt, previousMessages);

            devLog(`Successfully generated executor!`);
            success = true;

            if (saveWorkingCode) {
                saveAICode(key, jsCode, tsCode, typeDefinition);
            }

            return executor;
        } catch (e) {
            devLog(`Failed to generate executor for ${JSON.stringify(step, null, 4)}\nError: ${e} \n${tries} tries remaining`)
            tries--;
        }
    }

    throw new Error(`AI could not generate step: ${JSON.stringify(step)}`);
}
