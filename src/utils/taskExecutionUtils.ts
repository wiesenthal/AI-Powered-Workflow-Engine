import { Task, TaskOutput, Workflow } from "../types/Workflow";
import { StepOutput } from "../types/Step";
import { InputContext } from "../types/InputContext";
import { parseTaskOutput } from "./parsingUtils";
import { executeStep } from "./stepExecutionUtils";


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

export const executeTask = async (task: Task, workflow: Workflow, inputContext: InputContext): Promise<TaskOutput> => {
    if (!task) {
        throw new Error('Task not found');
    }

    console.log(`Executing task ${JSON.stringify(task)}`);

    const stepOutput = await executeTaskSteps(task, workflow, inputContext);

    const output = task.output !== undefined ? 
        await parseTaskOutput(task.output, workflow, inputContext) 
        : stepOutput;
    
    return output;
}