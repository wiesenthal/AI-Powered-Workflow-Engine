import { InputContext } from "../types/InputContext";
import { StepOutput, Step, UnparsedStep, UnparsedStepValue } from "../types/Step";
import { Workflow } from "../types/Workflow";
import { parseStep } from "./parsingUtils";
import { executeWaitStep, executeLengthStep, executeGtStep, executeIfStep } from "../steps/basicSteps";

type stepExecutorType = {
    [key: string] : (step: Step) => Promise<StepOutput>
}

const stepExecutors: stepExecutorType = {
    "wait": executeWaitStep,
    "length": executeLengthStep,
    "gt": executeGtStep,
    "if": executeIfStep
}

const parseRecursive = async (value: UnparsedStepValue, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<any> => {
    if (typeof value === 'string') {
        return await parseStep(value, workflow, inputContext, previousStepOutput);
    } else if (Array.isArray(value)) {
        return await Promise.all(value.map(async (v) => await parseRecursive(v, workflow, inputContext, previousStepOutput)));
    } else if (typeof value === 'object') {
        const parsedValue: UnparsedStepValue = {};
        for (let key in value) {
            parsedValue[key] = await parseRecursive(value[key], workflow, inputContext, previousStepOutput);
        }
        return parsedValue;
    }
    return value;
}

const parseAllStepFields = async (step: UnparsedStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<Step> => {
    let key = Object.keys(step)[0] as string;
    let value = step[key]

    if (typeof value === 'string') {
        value = await parseStep(value, workflow, inputContext, previousStepOutput);
    } else if (typeof value === 'object' || Array.isArray(value)) {
        value = await parseRecursive(value, workflow, inputContext, previousStepOutput);
    }

    const parsedStep: UnparsedStep = {
        [key]: value
    };

    return parsedStep;
}
    

export const executeStep = async (step: UnparsedStep, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    if (!step) {
        throw new Error('Step not found');
    }

    const parsedStep = await parseAllStepFields(step, workflow, inputContext, previousStepOutput);

    const key = Object.keys(parsedStep)[0];

    if (!key || !(key in stepExecutors)) {
        throw new Error(`Invalid step: ${JSON.stringify(step)}`);
    }

    const executor = stepExecutors[key];
    return await executor(parsedStep);
}