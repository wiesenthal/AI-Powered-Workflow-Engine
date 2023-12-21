import { Step, Task, Workflow } from "../types/Workflow";
import { InputContext } from "../types/InputContext";
import { getInputMatches, getTaskNameMatches, parseTaskOutput, replaceInputReferences, replaceTaskReferences } from "./parsingUtils";

const executeStep = async (step: Step, workflow: Workflow, inputContext: InputContext, previousStepOutput?: any): Promise<any> => {
    throw new Error('Not implemented');

    if (!step) {
        throw new Error('Invalid step format');
    }

    const stepType = Object.keys(step)[0];

    // switch (stepType) {
    //     case 'wait':
    //         return this.executeWaitStep(step);
    //     case 'length':
    //         return this.executeLengthStep(step, arg);
    //     case 'gt':
    //         return this.executeGtStep(step, arg);
    //     case 'if':
    //         return this.executeIfStep(step, arg);
    //     default:
    //         throw new Error(`Invalid step type ${stepType}`);
    // }
}

export const executeTaskSteps = async (task: Task, workflow: Workflow, inputContext: InputContext) => {
    if (!task.steps) {
        return;
    }

    let previousStepOutput: any = undefined;
    task.steps.forEach(async (step) => {
        console.log(`Executing step ${JSON.stringify(step)}`);
        previousStepOutput = await executeStep(step, workflow, inputContext, previousStepOutput);
    });
}

export const executeTask = async (task: Task, workflow: Workflow, inputContext: InputContext): Promise<string> => {
    if (!task) {
        throw new Error('Invalid task format');
    }

    console.log(`Executing task ${JSON.stringify(task)}`);

    executeTaskSteps(task, workflow, inputContext);

    let output = parseTaskOutput(task.output, workflow, inputContext);
    
    return output;
}