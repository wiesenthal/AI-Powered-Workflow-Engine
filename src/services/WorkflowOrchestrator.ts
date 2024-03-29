import { Socket } from "socket.io";
import WorkflowExecutor from "./WorkflowExecutor";
import openAIAuditor from "./OpenAIAuditor";
import { handleCheckWorkflowInputs, handleInputUpdates } from "../utils/inputHandling";
import { listAvailableWorkflows, loadWorkflow, updateWorkflow } from "../utils/fileUtils";
import { SharedError } from "../../shared/types/error";
import debugOutputter from "./DebugOutputter";
import { devLog } from "../utils/logging";

class WorkflowOrhestrator {

    private socket: Socket;
    private workflowExecutor: WorkflowExecutor;

    constructor(socket: Socket) {
        this.socket = socket;

        debugOutputter.setSocket(socket);
        openAIAuditor.setSocket(socket);

        this.workflowExecutor = new WorkflowExecutor();

        handleInputUpdates(this.socket, this.setInputContextValue);
        handleCheckWorkflowInputs(this.socket);

        this.handleGetWorkflowNames();
        this.handleGetWorkflowCode();
        this.handleUpdateWorkflowCode();
        this.handleWorkflowExecution();
    }

    private setInputContextValue = (key: string, value: string): void => {
        devLog(`Setting input context value for key ${key} with value ${value}`);
        this.workflowExecutor.inputContext[key] = value;
    }

    private handleGetWorkflowNames = () => {
        this.socket.on('getWorkflowNames', (callback: (workflowNames: string[]) => void) => {
            const workflowNames = listAvailableWorkflows();
            callback(workflowNames);
        });
    }

    private handleGetWorkflowCode = () => {
        this.socket.on('getWorkflowCode', (
            workflowName: string, 
            callback: (workflowCode: string | SharedError) => void
        ) => {
            try {
                const workflow = loadWorkflow(workflowName);
                callback(JSON.stringify(workflow, null, 4));
            }
            catch (error: any) {
                error = error as Error;
                debugOutputter.logError(error);
                callback({ errorMessage: error.message });
            }
        });
    }

    private handleUpdateWorkflowCode = () => {
        this.socket.on('updateWorkflowCode', (
            workflowName: string, 
            workflowCode: string
        ) => {
            try {
                JSON.parse(workflowCode);
                updateWorkflow(workflowName, workflowCode);
            }
            catch (error: any) {
                error = error as Error;
                debugOutputter.logError(error);
            }
        });
    }

    private executeWorkflow = async (workflowName: string): Promise<string> => {
        const workflow = loadWorkflow(workflowName);

        const output = await this.workflowExecutor.executeWorkflow(workflow);

        debugOutputter.logWorkflowCompletion(workflowName);
        return output;
    }

    private handleWorkflowExecution = () => {
        this.socket.on('executeWorkflow', async (
            workflowName: string, 
            callback: (output: string | SharedError) => void,
        ) => {

            devLog(`Executing workflow ${workflowName}`);

            try {
                const output = await this.executeWorkflow(workflowName);
                devLog(`Workflow executed, output: ${output}`);
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
