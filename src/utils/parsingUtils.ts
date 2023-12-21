import { InputContext } from "../types/InputContext";
import { Task, Workflow } from "../types/Workflow";
import { executeTask } from "./taskExecutionUtils";

const taskReferenceRegex = /\${([a-zA-Z0-9_]+)}/g;

export const getTaskNameMatches = (str: string): string[] => {
    const matches = str.match(taskReferenceRegex);

    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(taskReferenceRegex, '$1'));
}

export const replaceTaskReferences = (str: string, taskNameMatches: string[], taskOutputs: string[]): string => {
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


export const parseTaskOutputForInputs = (output: string, inputContext: InputContext): string => {
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

export const parseTaskOutputForTaskNames = async (output: string, workflow: Workflow, inputContext: InputContext): Promise<string> => {
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

export const parseTaskOutput = async (output: string, workflow: Workflow, inputContext: InputContext): Promise<string> => {
    output = await parseTaskOutputForTaskNames(output, workflow, inputContext);
    output = parseTaskOutputForInputs(output, inputContext);

    return output;
}