import { Socket } from "socket.io";
import { loadWorkflow } from "./fileUtils";
import { SharedError } from "../../shared/types/error";
import { getInputMatches } from "./parsingUtils";

type setInputFnType = (key: string, value: string) => void;

export const handleInputUpdates = (socket: Socket, setInputValue: setInputFnType) => {
    socket.on('setInputVariable', (key: string, value: string) => {
        console.log(`Received input update for key ${key} with value ${value}`);
        setInputValue(key, value);
    });
}

export const handleCheckWorkflowInputs = (socket: Socket) => {
    socket.on('checkWorkflowInputs', (workflowName: string, callback: (inputNames: string[] | SharedError) => void) => {
        console.log(`Received check workflow inputs request for workflow ${workflowName}`);
        
        try {
            const workflow = loadWorkflow(workflowName);
            
            callback(getInputMatches(JSON.stringify(workflow)));
        }
        catch {
            callback({ errorMessage: 'Error loading workflow' });
        }

    });
}
