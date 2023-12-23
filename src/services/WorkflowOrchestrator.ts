import { Socket } from "socket.io";
import WorkflowExecutor from "./WorkflowExecutor";
import { handleCheckWorkflowInputs, handleInputUpdates } from "../utils/inputHandling";
import { loadWorkflow } from "../utils/fileUtils";
import { SharedError } from "../../shared/types/error";
import debugOutputter from "./DebugOutputter";
import { devLog } from "../utils/logging";

class WorkflowOrhestrator {
    private socket: Socket;
    private workflowExecutor: WorkflowExecutor;
    constructor(socket: Socket) {
        this.socket = socket;

        debugOutputter.setSocket(socket);

        this.workflowExecutor = new WorkflowExecutor();

        handleInputUpdates(this.socket, this.setInputContextValue);
        handleCheckWorkflowInputs(this.socket);

        this.handleWorkflowExecution();
    }

    private setInputContextValue = (key: string, value: string): void => {
        devLog(`Setting input context value for key ${key} with value ${value}`);
        this.workflowExecutor.inputContext[key] = value;
    }

    private handleWorkflowExecution = () => {
        this.socket.on('executeWorkflow', async (
            workflowName: string, 
            callback: (output: string | SharedError) => void,
        ) => {

            devLog(`Executing workflow ${workflowName}`);

            try {
                const workflow = loadWorkflow(workflowName);

                devLog(`Workflow loaded: ${JSON.stringify(workflow)}`)

                const output = await this.workflowExecutor.executeWorkflow(workflow);

                devLog(`Workflow executed, output: ${output}`);

                debugOutputter.logWorkflowCompletion(workflowName);
                callback(output);
            } 
            catch (error: any) {
                error = error as Error;
                devLog(`Error executing workflow: ${error}`);
                debugOutputter.logError(error);
                callback({ errorMessage: error.message });
            }
        });
    }
}

export default WorkflowOrhestrator;
