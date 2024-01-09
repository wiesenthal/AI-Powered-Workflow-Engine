import { Task, TaskOutput, Workflow } from "../types/Workflow";
import { StepOutput } from "../types/Step";
import { InputContext } from "../types/InputContext";
import { parseTaskOutput } from "./parsingUtils";
import { executeStep } from "./stepExecutionUtils";
import debugOutputter from "../services/DebugOutputter";
import { devLog } from "./logging";

export const executeTaskSteps = async (
    taskName: string, 
    task: Task, 
    workflow: Workflow, 
    inputContext: InputContext
): Promise<StepOutput> => {
    if (!task.steps) {
        return task.output;
    }

    let previousStepOutput: StepOutput = await executeStep(task.steps[0], workflow, inputContext);
    debugOutputter.logStepCompletion(taskName, 0, task.steps[0], previousStepOutput);

    for (let i = 1; i < task.steps.length; i++) {
        const step = task.steps[i];
        devLog(`Executing step ${JSON.stringify(step)}`);

        previousStepOutput = await executeStep(step, workflow, inputContext, previousStepOutput);

        debugOutputter.logStepCompletion(taskName, i, step, previousStepOutput);
    }

    return previousStepOutput;
}

export const executeTask = async (
    taskName: string,
    workflow: Workflow,
    inputContext: InputContext
): Promise<TaskOutput> => {
    const task = workflow.tasks[taskName];
    if (!task) {
        debugOutputter.logError(new Error('Task not found'));
        throw new Error('Task not found');
    }

    devLog(`Executing task ${JSON.stringify(task)}`);

    let output = await executeTaskSteps(taskName, task, workflow, inputContext);

    if (task.output !== undefined) {
        output = await parseTaskOutput(task.output, workflow, inputContext);
        debugOutputter.logTaskCompletion(taskName, task.output, output);
    }

    return output;
}
