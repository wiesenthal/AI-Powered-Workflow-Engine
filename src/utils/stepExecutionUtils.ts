import dotenv from "dotenv";
dotenv.config();

import { InputContext } from "../types/InputContext";
import { StepOutput, Step, UnparsedStep } from "../types/Step";
import { Workflow } from "../types/Workflow";
import { executeWaitStep, executeLengthStep, executeGtStep, executeIfStep } from "../steps/basicSteps";
import { parseAllStepFields } from "./parsingUtils";
import { tryGenerateWorkingStepExecutorWithAI } from "./aiGenerationUtils";
import { devLog } from "./logging";
import debugOutputter from "../services/DebugOutputter";
import { loadGeneratedExecutorCodes } from "./fileUtils";

export type stepExecutorFunction = (step: Step) => Promise<StepOutput>;

export type stepExecutorMapping = {
    [key: string]: stepExecutorFunction
}

const basicStepExecutors: stepExecutorMapping = {
    "wait": executeWaitStep,
    "length": executeLengthStep,
    "gt": executeGtStep,
    "if": executeIfStep
}

const getAIGeneratedExecutor = async (step: Step): Promise<stepExecutorFunction> => {
    const key = Object.keys(step)[0];

    for (const [stepName, executorCode] of loadGeneratedExecutorCodes()) {
        if (stepName === key) {
            debugOutputter.logPlain(`Executing Step '${key}' with previously AI generated executor.`);
            devLog(`Step '${key}' found in previously AI generated steps, using executor.`);
            const executor = eval(`${executorCode}; execute;`);
            return executor;
        }
    }

    debugOutputter.logPlain(`'${key}' step unrecognized, AI trying to generate new executor...`);
    devLog(`Step '${key}' not found, AI generating new executor for ${JSON.stringify(step)}`)
    return await tryGenerateWorkingStepExecutorWithAI(step, 3, true);
}

export const executeStep = async (
    step: UnparsedStep,
    workflow: Workflow,
    inputContext: InputContext,
    previousStepOutput?: StepOutput
): Promise<StepOutput> => {
    if (!step) {
        throw new Error('Step not found');
    }

    const parsedStep = await parseAllStepFields(step, workflow, inputContext, previousStepOutput);

    const key = Object.keys(parsedStep)[0];

    let executor: stepExecutorFunction;
    if (key in basicStepExecutors) {
        executor = basicStepExecutors[key];
    } else if (process.env.AI_ENABLED) {
        executor = await getAIGeneratedExecutor(parsedStep);
    } else {
        throw new Error(`Invalid step: ${JSON.stringify(step)}`);
    }

    return await executor(parsedStep);
}
