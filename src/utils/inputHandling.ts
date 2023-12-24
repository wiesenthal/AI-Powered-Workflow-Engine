import { Socket } from "socket.io";
import { loadWorkflow } from "./fileUtils";
import { SharedError } from "../../shared/types/error";
import { getInputMatches } from "./parsingUtils";
import { devLog } from "./logging";

type setInputFnType = (key: string, value: string) => void;

export const handleInputUpdates = (
    socket: Socket,
    setInputValue: setInputFnType
): void => {
    socket.on('setInputVariable', (key: string, value: string) => {
        devLog(`Received input update for key ${key} with value ${value}`);
        setInputValue(key, value);
    });
}

export const handleCheckWorkflowInputs = (socket: Socket): void => {
    socket.on('checkWorkflowInputs', (workflowName: string, callback: (inputNames: string[] | SharedError) => void) => {
        devLog(`Received check workflow inputs request for workflow ${workflowName}`);

        try {
            const workflow = loadWorkflow(workflowName);

            const inputMatches = getInputMatches(JSON.stringify(workflow));

            const uniqueInputMatches = [...new Set(inputMatches)];

            callback(uniqueInputMatches);
        }
        catch {
            callback({ errorMessage: 'Error loading workflow' });
        }

    });
}
