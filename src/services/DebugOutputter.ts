import { Socket } from 'socket.io';
import { DebugOutput } from '../../shared/types/debug';
import { TaskOutput } from '../types/Workflow';
import { SharedError } from '../../shared/types/error';
import { UnparsedStep } from '../types/Step';
import { devLog } from '../utils/logging';

class DebugOutputter {
    private socket?: Socket;
    private storedOutputs: DebugOutput[]; // For when the socket is not yet set and there happens to be outputs. Shouldn't happen during normal execution.
    constructor() {
        this.storedOutputs = [];
    }

    public setSocket = (socket: Socket): void => {
        this.socket = socket;
    }

    public output = (output: DebugOutput): void => {
        if (this.socket) {
            if (this.storedOutputs.length > 0) {
                this.storedOutputs.forEach(storedOutput => {
                    this.socket?.emit('debugOutput', storedOutput);
                });
                this.storedOutputs = [];
            }
            this.socket.emit('debugOutput', output);
        }
        else {
            this.storedOutputs.push(output);
        }
    }

    public logTaskCompletion = (
        taskName: string,
        unparsed: TaskOutput,
        result: TaskOutput
    ): void => {
        if (typeof result !== 'string') {
            result = JSON.stringify(result);
        }
        this.output({
            task: taskName,
            step: "output",
            unparsed: unparsed,
            result,
        });
    }

    public logStepCompletion = (
        taskName: string,
        step: number,
        stepDetails: UnparsedStep,
        result: TaskOutput
    ): void => {
        if (typeof result !== 'string') {
            result = JSON.stringify(result);
        }
        const command = Object.keys(stepDetails)[0] as keyof UnparsedStep;
        const unparsed = stepDetails[command];

        this.output({
            task: taskName,
            step,
            command,
            unparsed,
            result,
        });
    }

    public logWorkflowCompletion = (workflowName: string): void => {
        this.output({
            completedWorkflow: workflowName
        });
    }

    public logError = (error: Error | SharedError): void => {
        if (error instanceof Error) {
            error = {
                errorMessage: error.message
            }
        }
        this.output({
            error: error
        });
    }

    public logPlain = (message: string): void => {
        this.output({
            plainMessage: message
        });
    }

    public clearStoredOutputs = (): void => {
        this.storedOutputs = [];
    }
}

export default new DebugOutputter();