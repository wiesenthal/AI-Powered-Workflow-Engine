import { Socket } from "socket.io";
import WorkflowExecutor from "./WorkflowExecutor";
import { handleInputUpdates } from "../utils/inputHandling";
import { loadWorkflow } from "../utils/fileUtils";

class WorkflowOrhestrator {
    private socket: Socket;
    private workflowExecutor: WorkflowExecutor;
    constructor(socket: Socket) {
        this.socket = socket;
        this.workflowExecutor = new WorkflowExecutor();

        handleInputUpdates(this.socket, this.setInputContextValue);

        this.handleWorkflowExecution();
    }

    private setInputContextValue = (key: string, value: string): void => {
        console.log(`Setting input context value for key ${key} with value ${value}`);
        this.workflowExecutor.inputContext[key] = value;
    }

    private handleWorkflowExecution = () => {
        this.socket.on('executeWorkflow', async (
            workflowName: string, 
            callback: (output: string | Object) => void,
        ) => {
            console.log(`Executing workflow ${workflowName}`);
            try {
                const workflow = loadWorkflow(workflowName);
                console.log(`Workflow loaded: ${JSON.stringify(workflow)}`)
                const output = await this.workflowExecutor.executeWorkflow(workflow);
                console.log(`Workflow executed, output: ${output}`);
                callback(output);
            } catch (error: any) {
                error = error as Error;
                console.log(`Error executing workflow: ${error}`);
                callback({ errorMessage: error.message });
            }
        });
    }
}

export default WorkflowOrhestrator;
