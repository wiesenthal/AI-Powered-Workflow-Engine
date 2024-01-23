import { get } from "http";
import { InputContext } from "../types/InputContext";
import { Step, StepOutput, StepValue, UnparsedStep, UnparsedStepValue } from "../types/Step";
import { Task, TaskOutput, Workflow } from "../types/Workflow";
import { devLog } from "./logging";
import { executeTask } from "./taskExecutionUtils";

export const taskReferenceRegex = /\$\{((?!0)[a-zA-Z0-9_]+)\}/g;
export const previousStepOutputRegex = /\$\{0\}/g;
export const inputReferenceRegex = /\@\{([a-zA-Z0-9_]+)\}/g;

export const getMatches = (str: string, regex: RegExp): { match: string, key: string }[] => {
    const matches = str.match(regex);

    if (!matches) {
        return [];
    }

    return matches.map(match => {
        return {
            "match": match,
            "key": match.replace(regex, '$1')
        };
    });
}

export const replaceReferences = (
    str: string,
    matches: { match: string, key: string }[],
    keyValues: { [key: string]: string }
): string => {
    for (let match of matches) {
        const key = match.key;
        const value = keyValues[key] || '';
        const matchStr = match.match;

        str = str.replace(matchStr, value);
    }

    return str;
}

export const parseOutputForInputs = (
    output: string,
    inputContext: InputContext
): string => {
    const inputMatches = getMatches(output, inputReferenceRegex);

    if (inputMatches.length > 0) {
        output = replaceReferences(output, inputMatches, inputContext);
    }

    return output;
}

export const parseOutputForTaskNames = async (
    output: string,
    workflow: Workflow,
    inputContext: InputContext
): Promise<string> => {
    const taskNameMatches = getMatches(output, taskReferenceRegex);

    if (taskNameMatches.length == 0) {
        return output;
    }

    if (taskNameMatches.some(({ match, key }) => !workflow.tasks[key])) {
        throw new Error(`Missing task referenced: ${taskNameMatches}`);
    }

    const taskOutputs = await Promise.all(
        taskNameMatches.map(
            async ({ key, match }) => {
                return [
                    key,
                    (await executeTask(key, workflow, inputContext)).toString()
                ];
            })
    ).then(Object.fromEntries);

    output = replaceReferences(output, taskNameMatches, taskOutputs);

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


const parseObjectOrArray = async (
    value: UnparsedStepValue,
    workflow: Workflow,
    inputContext: InputContext,
    previousStepOutput?: StepOutput
): Promise<StepValue> => {
    if (typeof value === 'string') {
        return await parseStep(value, workflow, inputContext, previousStepOutput);
    } else if (Array.isArray(value)) {
        return await Promise.all(value.map(async (v) => await parseObjectOrArray(v, workflow, inputContext, previousStepOutput)));
    } else if (typeof value === 'object') {
        const parsedValue: UnparsedStepValue = {};
        for (let key in value) {
            parsedValue[key] = await parseObjectOrArray(value[key], workflow, inputContext, previousStepOutput);
        }
        return parsedValue;
    }
    return value;
};

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
        return await parseObjectOrArray(str, workflow, inputContext, previousStepOutput);
    }

    return str;
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
        value = await parseObjectOrArray(value, workflow, inputContext, previousStepOutput);
    }

    const parsedStep: UnparsedStep = {
        [key]: value
    };

    return parsedStep;
};