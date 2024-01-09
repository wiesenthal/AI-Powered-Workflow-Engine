import { InputContext } from "../types/InputContext";
import { Step, StepOutput, StepValue, UnparsedStep, UnparsedStepValue } from "../types/Step";
import { Task, TaskOutput, Workflow } from "../types/Workflow";
import { devLog } from "./logging";
import { executeTask } from "./taskExecutionUtils";

const taskReferenceRegex = /\$\{((?!0)[a-zA-Z0-9_]+)\}/g;
const previousStepOutputRegex = /\$\{0\}/g;
const inputReferenceRegex = /\@\{([a-zA-Z0-9_]+)\}/g;

export const getTaskNameMatches = (str: string): string[] => {
    const matches = str.match(taskReferenceRegex);

    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(taskReferenceRegex, '$1'));
}

export const replaceTaskReferences = (
    str: string,
    taskNameMatches: string[],
    taskOutputs: string[]
): string => {
    for (let i = 0; i < taskNameMatches.length; i++) {
        const match = taskNameMatches[i];
        const taskOutput = taskOutputs[i];

        str = str.replace(`\$\{${match}}`, taskOutput);
    }

    return str;
}

export const getInputMatches = (str: string): string[] => {
    const matches = str.match(inputReferenceRegex);

    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(inputReferenceRegex, '$1'));
}

export const replaceInputReferences = (
    str: string,
    inputMatches: string[],
    inputValues: string[]
): string => {
    for (let i = 0; i < inputMatches.length; i++) {
        const match = inputMatches[i];
        const inputValue = inputValues[i];

        if (!inputValue) {
            str = str.replace(`\@\{${match}\}`, '');
        }

        str = str.replace(`\@\{${match}\}`, inputValue);
    }

    return str;
}


export const parseOutputForInputs = (
    output: string,
    inputContext: InputContext
): string => {
    const inputMatches = getInputMatches(output);

    if (inputMatches.length > 0) {
        const inputValues = inputMatches.map(
            (inputMatch: string) =>
                inputContext[inputMatch]
        );

        output = replaceInputReferences(output, inputMatches, inputValues);
    }

    return output;
}

export const parseOutputForTaskNames = async (
    output: string,
    workflow: Workflow,
    inputContext: InputContext
): Promise<string> => {
    const taskNameMatches = getTaskNameMatches(output);

    if (taskNameMatches.length > 0) {
        if (taskNameMatches.some((taskNameMatch: string) => !workflow.tasks[taskNameMatch])) {
            throw new Error(`Missing task referenced: ${taskNameMatches}`);
        }

        const taskOutputs = await Promise.all(
            taskNameMatches.map(
                async (taskName: string) => {
                    const taskOutput = await executeTask(taskName, workflow, inputContext);
                    return (typeof taskOutput === 'string' ? taskOutput : JSON.stringify(taskOutput));
                }
            )
        );

        output = replaceTaskReferences(output, taskNameMatches, taskOutputs);
    }

    return output;
}

export const parseTaskOutput = async (
    output: TaskOutput,
    workflow: Workflow,
    inputContext: InputContext
): Promise<TaskOutput> => {
    if (typeof output === 'number' || typeof output === 'boolean')
        return output;
    output = await parseOutputForTaskNames(output, workflow, inputContext);

    output = parseOutputForInputs(output, inputContext);

    return output;
}

export const parseStepForPreviousOutput = (
    str: string,
    previousStepOutput?: StepOutput
): StepOutput => {
    if (previousStepOutput === undefined) {
        if (str.match(previousStepOutputRegex)) {
            throw new Error('First step cannot reference previous step str');
        }
        return str;
    }

    if (!str.match(previousStepOutputRegex)) {
        return str;
    }

    if (typeof previousStepOutput === 'string') {
        return str.replace(previousStepOutputRegex, previousStepOutput);
    } else {
        if (str !== "${0}") {
            return str.replace(previousStepOutputRegex, JSON.stringify(previousStepOutput));
        }
        return previousStepOutput;
    }
}

export const parseStep = async (
    str: StepOutput,
    workflow: Workflow,
    inputContext: InputContext,
    previousStepOutput?: StepOutput
): Promise<StepValue> => {
    devLog(`Parsing step ${str}, type ${typeof str}, previousStepOutput: ${previousStepOutput}`);
    if (typeof str === 'number' || typeof str === 'boolean')
        return str;

    str = parseOutputForInputs(str, inputContext);

    str = await parseOutputForTaskNames(str, workflow, inputContext);

    str = parseStepForPreviousOutput(str, previousStepOutput);

    if (typeof str === 'number' || typeof str === 'boolean')
        return str;

    if (typeof str !== 'string') {
        return await parseRecursive(str, workflow, inputContext, previousStepOutput);
    }

    return str;
};

const parseRecursive = async (
    value: UnparsedStepValue,
    workflow: Workflow,
    inputContext: InputContext,
    previousStepOutput?: StepOutput
): Promise<StepValue> => {
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
};

export const parseAllStepFields = async (
    step: UnparsedStep,
    workflow: Workflow,
    inputContext: InputContext,
    previousStepOutput?: StepOutput
): Promise<Step> => {
    let key = Object.keys(step)[0] as string;
    let value = step[key];

    if (typeof value === 'string') {
        value = await parseStep(value, workflow, inputContext, previousStepOutput);
    } else if (typeof value === 'object' || Array.isArray(value)) {
        value = await parseRecursive(value, workflow, inputContext, previousStepOutput);
    }

    const parsedStep: UnparsedStep = {
        [key]: value
    };

    return parsedStep;
};
