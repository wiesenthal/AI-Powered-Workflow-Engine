import { InputContext } from "../types/InputContext";
import { StepOutput } from "../types/Step";
import { Task, TaskOutput, Workflow } from "../types/Workflow";
import { executeTask } from "./taskExecutionUtils";

const taskReferenceRegex = /\${([a-zA-Z0-9_]+)}/g;

export const getTaskNameMatches = (str: string): string[] => {
    const matches = str.match(taskReferenceRegex);

    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(taskReferenceRegex, '$1'));
}

export const replaceTaskReferences = (str: string, taskNameMatches: string[], taskOutputs: TaskOutput[]): TaskOutput => {
    for (let i = 0; i < taskNameMatches.length; i++) {
        const match = taskNameMatches[i];
        const taskOutput = taskOutputs[i];

        str = str.replace(`\${${match}}`, taskOutput);
    }

    return str;
}

const inputReferenceRegex = /\@{([a-zA-Z0-9_]+)}/g;

export const getInputMatches = (str: string): string[] => {
    const matches = str.match(inputReferenceRegex);

    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(inputReferenceRegex, '$1'));
}

export const replaceInputReferences = (str: string, inputMatches: string[], inputValues: string[]): string => {
    for (let i = 0; i < inputMatches.length; i++) {
        const match = inputMatches[i];
        const inputValue = inputValues[i];

        if (!inputValue) {
            str = str.replace(`\@{${match}}`, '');
        }

        str = str.replace(`\@{${match}}`, inputValue);
    }

    return str;
}


export const parseOutputForInputs = (output: string, inputContext: InputContext): string => {
    const inputMatches = getInputMatches(output);

    if (inputMatches) {
        const inputValues = inputMatches.map(
            (inputMatch: string) => 
                inputContext[inputMatch]
        );

        output = replaceInputReferences(output, inputMatches, inputValues);
    }

    return output;
}

export const parseOutputForTaskNames = async (output: string, workflow: Workflow, inputContext: InputContext): Promise<string> => {
    const taskNameMatches = getTaskNameMatches(output);

    if (taskNameMatches) {
        const tasksReferenced = taskNameMatches.map(
            (taskReferenceMatch: string) => 
                workflow.tasks[taskReferenceMatch]
        );

        const tasksReferencedOutputs = await Promise.all(
            tasksReferenced.map(
                async (taskReferenced: Task) =>
                    await executeTask(taskReferenced, workflow, inputContext)
            )
        );
        
        output = replaceTaskReferences(output, taskNameMatches, tasksReferencedOutputs);
    }

    return output;
}

export const parseTaskOutput = async (output: TaskOutput, workflow: Workflow, inputContext: InputContext): Promise<TaskOutput> => {
    output = await parseOutputForTaskNames(output, workflow, inputContext);
    output = parseOutputForInputs(output, inputContext);

    return output;
}

const previousStepOutputRegex = /\${0}/g;

export const parseStepForPreviousOutput = (str: string, previousStepOutput: StepOutput): StepOutput => {
    if (!previousStepOutput && str.match(previousStepOutputRegex)) {
        throw new Error('First step cannot reference previous step str');
    }

    if (typeof previousStepOutput === 'string') {
        str = str.replace(previousStepOutputRegex, previousStepOutput);
    }
    if (typeof previousStepOutput === 'number' || typeof previousStepOutput === 'boolean') {
        if (str !== "${0}") {
            throw new Error('Cannot reference previous step output that is a number of boolean in a string unless is it alone in the string');
        }
        return previousStepOutput as typeof previousStepOutput;
    }

    return str;
}

export const parseStep = async (str: StepOutput, workflow: Workflow, inputContext: InputContext, previousStepOutput?: StepOutput): Promise<StepOutput> => {
    console.log(`Parsing step ${str}, type ${typeof str}`);
    if (typeof str === 'number' || typeof str === 'boolean')
        return str;

    if (previousStepOutput)
        str = parseStepForPreviousOutput(str, previousStepOutput);

    if (typeof str === 'number' || typeof str === 'boolean')
        return str;

    str = await parseOutputForTaskNames(str, workflow, inputContext);

    str = parseOutputForInputs(str, inputContext);

    return str;
}