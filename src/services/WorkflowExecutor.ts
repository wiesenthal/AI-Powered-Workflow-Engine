import { Workflow } from '../types/Workflow';
import { InputContext } from '../types/InputContext';
import { executeTask } from '../utils/taskExecutionUtils';

class WorkflowExecutor {
    public inputContext: InputContext;
    constructor() {
        this.inputContext = {};
    }

    public executeWorkflow = async (workflow: Workflow): Promise<string> => {
        const entryPoint = workflow.entry_point;
        const tasks = workflow.tasks;

        if (!entryPoint || !tasks || !tasks[entryPoint]) {
            throw new Error('Invalid workflow format');
        }

        console.log(`Executing workflow with entry point ${entryPoint}`);

        const output = await executeTask(tasks[entryPoint], workflow, this.inputContext);

        console.log(`Workflow executed, output: ${output}`);

        return output;
    }
}

export default WorkflowExecutor;
