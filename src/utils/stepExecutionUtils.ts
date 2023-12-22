import { InputContext } from "../types/InputContext";
import { WaitStep, StepOutput, Step, LengthStep, GtStep, IfStep, UnparsedWaitStep, UnparsedStep, UnparsedLengthStep, UnparsedGtStep, UnparsedIfStep } from "../types/Step";
import { Workflow } from "../types/Workflow";
import { devLog } from "./logging";
import { parseStep } from "./parsingUtils";


const executeWaitStep = async (unparsedStep: UnparsedWaitStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    const value = unparsedStep.wait;
    const waitTime = await parseStep(value, workflow, inputContext, previousStepOutput);

    if (typeof waitTime !== 'number') {
        throw new Error('Wait time must be a number');
    }
    
    devLog(`Waiting for ${waitTime}s`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(previousStepOutput ? previousStepOutput : ''); // unspecified wait step return time, 
        }, waitTime * 1000);
    });
}

const executeLengthStep = async (unparsedStep: UnparsedLengthStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<number> => {
    const value = unparsedStep.length;
    const str = await parseStep(value, workflow, inputContext, previousStepOutput);

    if (typeof str !== 'string') {
        throw new Error('Length value must be a string');
    }

    return str.length;
}

const executeGtStep = async (unparsedStep: UnparsedGtStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<boolean> => {
    const value = unparsedStep.gt;
    const [a, b] = await Promise.all(value.map(async (v) => await parseStep(v, workflow, inputContext, previousStepOutput)));

    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error(`Gt values must be numbers. a: ${a}, b: ${b}`);
    }

    return a > b;
}

const executeIfStep = async (unparsedStep: UnparsedIfStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    const value = unparsedStep.if;

    const condition = await parseStep(value.condition, workflow, inputContext, previousStepOutput);
    if (typeof condition !== 'boolean') {
        throw new Error('If condition must be a boolean');
    }

    return condition ? 
        await parseStep(value.true, workflow, inputContext, previousStepOutput) 
        :
        await parseStep(value.false, workflow, inputContext, previousStepOutput);
}
    

export const executeStep = async (step: UnparsedStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    if (!step) {
        throw new Error('Step not found');
    }

    const key = Object.keys(step)[0] as keyof Step;

    switch (key) {
        case 'wait':
            return executeWaitStep(step as UnparsedWaitStep, workflow, inputContext, previousStepOutput);
        case 'length':
            return executeLengthStep(step as UnparsedLengthStep, workflow, inputContext, previousStepOutput);
        case 'gt':
            return executeGtStep(step as UnparsedGtStep, workflow, inputContext, previousStepOutput);
        case 'if':
            return executeIfStep(step as UnparsedIfStep, workflow, inputContext, previousStepOutput);
        default:
            throw new Error(`Invalid step type ${key}`);
    }
}