import { v4 as uuidv4 } from 'uuid';
import { Workflow, Task, WorkflowContext } from '../../types/Workflow';

class WorkflowExecutor {
    private workflowContexts: Map<string, WorkflowContext>;
    constructor() {
        this.workflowContexts = new Map();
    }

    async executeWorkflow(workflow: Workflow): Promise<string> {
        const workflowId = uuidv4();

        this.workflowContexts.set(
            workflowId, {
                workflow,
                inputs: {}
        });

        const entryPoint = workflow.entry_point;
        const tasks = workflow.tasks;

        if (!entryPoint || !tasks || !tasks[entryPoint]) {
            throw new Error('Invalid workflow format');
        }

        console.log(`Executing workflow ${workflowId} with entry point ${entryPoint}`);

        const output = await this.executeTask(tasks[entryPoint]);

        console.log(`Workflow ${workflowId} executed, output: ${output}`);

        this.workflowContexts.delete(workflowId);

        return output;
    }

    async executeTask(task: Task, arg?: any): Promise<string> {
        if (!task) {
            throw new Error('Invalid task format');
        }

        console.log(`Executing task ${JSON.stringify(task)}`);

        if (task.steps) {
            let previousStepOutput: any = undefined;
            task.steps.forEach(async (step) => {
                console.log(`Executing step ${JSON.stringify(step)}`);
                previousStepOutput = await this.executeTask(step, previousStepOutput);
            });
        }

        return task.output;
    }
}

export default new WorkflowExecutor();