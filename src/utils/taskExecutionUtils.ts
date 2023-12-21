import { Task, TaskOutput, Workflow } from "../types/Workflow";
import { PossibleStepKeys, PossibleStepValues, Step, StepOutput, WaitStep } from "../types/Step";
import { InputContext } from "../types/InputContext";
import { parseTaskOutput, parseStep } from "./parsingUtils";
import { number } from "yargs";
import { parse } from "path";

const executeWaitStep = async (unparsedStep: WaitStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    const value = unparsedStep.wait as string | number;
    const waitTime = await parseStep(value, workflow, inputContext, previousStepOutput);

    if (typeof waitTime !== 'number') {
        throw new Error('Wait time must be a number');
    }
    
    console.log(`Waiting for ${waitTime}s`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(previousStepOutput ? previousStepOutput : '');
        }, waitTime * 1000);
    });
}

const executeStep = async (step: Step, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    if (!step) {
        throw new Error('Invalid step format');
    }

    const key = Object.keys(step)[0] as PossibleStepKeys;

    switch (key) {
        case 'wait':
            return executeWaitStep(step as WaitStep, workflow, inputContext, previousStepOutput);
        // case 'length':
        //     return this.executeLengthStep(step, arg);
        // case 'gt':
        //     return this.executeGtStep(step, arg);
        // case 'if':
        //     return this.executeIfStep(step, arg);
        default:
            throw new Error(`Invalid step type ${key}`);
    }
}

export const executeTaskSteps = async (task: Task, workflow: Workflow, inputContext: InputContext): Promise<StepOutput> => {
    if (!task.steps) {
        return task.output;
    }

    let previousStepOutput: StepOutput = await executeStep(task.steps[0], workflow, inputContext);

    for (const step of task.steps.slice(1)) {
        console.log(`Executing step ${JSON.stringify(step)}`);
        previousStepOutput = await executeStep(step, workflow, inputContext, previousStepOutput);
    }

    return previousStepOutput;
}

export const executeTask = async (task: Task, workflow: Workflow, inputContext: InputContext): Promise<string> => {
    if (!task) {
        throw new Error('Invalid task format');
    }

    console.log(`Executing task ${JSON.stringify(task)}`);

    const stepOutput = await executeTaskSteps(task, workflow, inputContext);

    const output = task.output ? 
        await parseTaskOutput(task.output, workflow, inputContext) 
        : stepOutput;
    
    return output as TaskOutput;
}