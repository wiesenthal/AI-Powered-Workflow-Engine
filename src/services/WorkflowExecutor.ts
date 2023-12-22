import { TaskOutput, Workflow } from '../types/Workflow';
import { InputContext } from '../types/InputContext';
import { executeTask } from '../utils/taskExecutionUtils';
import { devLog } from '../utils/logging';

class WorkflowExecutor {
    public inputContext: InputContext;
    constructor() {
        this.inputContext = {};
    }

    public executeWorkflow = async (workflow: Workflow): Promise<string> => {
        const entryPoint = workflow.entry_point;
        const tasks = workflow.tasks;

        if (!entryPoint || !tasks || !tasks[entryPoint]) {
            throw new Error(`Invalid workflow: ${JSON.stringify(workflow)}`);
        }

        devLog(`Executing workflow with entry point ${entryPoint}`);

        let output = await executeTask(entryPoint, workflow, this.inputContext);

        if (typeof output !== 'string') {
            output = JSON.stringify(output);
        }

        devLog(`Workflow executed, output: ${output}`);

        return output;
    }
}

export default WorkflowExecutor;
