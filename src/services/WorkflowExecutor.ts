import { v4 as uuidv4 } from 'uuid';
import { Workflow, Task, WorkflowContext } from '../../types/Workflow';
import { getTaskNameMatches, replaceTaskReferences } from '../utils/parsingUtils';

class WorkflowExecutor {
    private workflowContexts: Map<string, WorkflowContext>;
    constructor() {
        this.workflowContexts = new Map();
    }

    async executeWorkflow(workflow: Workflow): Promise<string> {
        const entryPoint = workflow.entry_point;
        const tasks = workflow.tasks;

        if (!entryPoint || !tasks || !tasks[entryPoint]) {
            throw new Error('Invalid workflow format');
        }

        const workflowContext: WorkflowContext = {
            workflow,
            inputs: {}
        }

        console.log(`Executing workflow with entry point ${entryPoint}`);

        const output = await this.executeTask(tasks[entryPoint], workflowContext);

        console.log(`Workflow executed, output: ${output}`);

        return output;
    }

    async executeTask(task: Task, workflowContext: WorkflowContext): Promise<string> {
        if (!task) {
            throw new Error('Invalid task format');
        }

        console.log(`Executing task ${JSON.stringify(task)}`);

        if (task.steps) {
            let previousStepOutput: any = undefined;
            task.steps.forEach(async (step) => {
                console.log(`Executing step ${JSON.stringify(step)}`);
                previousStepOutput = await this.executeStep(step, previousStepOutput);
            });
        }

        let output = task.output;

        const taskNameMatches = getTaskNameMatches(output);

        if (taskNameMatches) {
            const tasksReferenced = taskNameMatches.map(
                (taskReferenceMatch: string) => 
                    workflowContext.workflow.tasks[taskReferenceMatch]
            );

            const tasksReferencedOutputs = await Promise.all(
                tasksReferenced.map(
                    async (taskReferenced: Task) =>
                        await this.executeTask(taskReferenced, workflowContext)
                )
            );
            
            output = replaceTaskReferences(output, taskNameMatches, tasksReferencedOutputs);
        }
        
        return output;
    }

    async executeStep(step: any, arg?: any): Promise<any> {
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
}

export default new WorkflowExecutor();