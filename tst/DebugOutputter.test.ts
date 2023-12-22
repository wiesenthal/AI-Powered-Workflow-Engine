import DebugOutputter from '../src/services/DebugOutputter';
import { Socket } from 'socket.io';
import { DebugOutput } from '../shared/types/debug';
import { TaskOutput } from '../src/types/Workflow';
import { SharedError } from '../shared/types/error';
import { StepOutput, UnparsedStep } from '../src/types/Step';

describe('DebugOutputter', () => {
    let mockSocket: Socket;

    beforeEach(() => {
        mockSocket = {
            emit: jest.fn(),
        } as unknown as Socket;
        DebugOutputter.setSocket(mockSocket);
    });

    afterEach(() => {
        DebugOutputter.clearStoredOutputs();
    });

    it('should output debug messages', () => {
        const debugOutput: DebugOutput = {
            task: 'Task 1',
            step: "output",
            result: 'Hello world!',
        };

        DebugOutputter.output(debugOutput);

        // Assert that the debug output is sent to the socket
        // You can use a mocking library like Jest's `mockReturnValueOnce` to mock the behavior of the socket
        expect(mockSocket.emit).toHaveBeenCalledWith('debugOutput', debugOutput);
    });

    it('should log task completion', () => {
        const taskName = 'Task 1';
        const unparsed: TaskOutput = 'Hello ${world}!';
        const result: TaskOutput = 'Hello world!';

        DebugOutputter.logTaskCompletion(taskName, unparsed, result);

        // Assert that the task completion is sent to the socket
        expect(mockSocket.emit).toHaveBeenCalledWith('debugOutput', {
            "task": "Task 1",
            "step": "output",
            "unparsed": "Hello ${world}!",
            "result": "Hello world!"
        });
    });

    it('should log step completion', () => {
        const taskName = 'Task 1';
        const step = 1;
        const stepDetails: UnparsedStep = {
            wait: 1,
        };
        const result: StepOutput = 'Hello world!';

        DebugOutputter.logStepCompletion(taskName, step, stepDetails, result);

        // Assert that the step completion is sent to the socket
        expect(mockSocket.emit).toHaveBeenCalledWith('debugOutput', {
            "task": "Task 1",
            "step": 1,
            "command": "wait",
            "unparsed": 1,
            "result": "Hello world!"
        });
    });

    it('should log workflow completion', () => {
        const workflowName = 'Workflow 1';

        DebugOutputter.logWorkflowCompletion(workflowName);

        // Assert that the workflow completion is sent to the socket
        expect(mockSocket.emit).toHaveBeenCalledWith('debugOutput', {
            "completedWorkflow": "Workflow 1"
        });
    });

    it('should log errors', () => {
        const error: Error | SharedError = new Error('Something went wrong');

        DebugOutputter.logError(error);

        // Assert that the error is sent to the socket
        expect(mockSocket.emit).toHaveBeenCalledWith('debugOutput', {
            "error": {
                "errorMessage": "Something went wrong"
            }
        });
    });
});