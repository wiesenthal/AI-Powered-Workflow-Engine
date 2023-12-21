import WorkflowExecutor from '../src/services/WorkflowExecutor';
import { Workflow, Task } from '../src/types/Workflow';

describe('WorkflowExecutor', () => {
    let workflowExecutor: WorkflowExecutor;

    beforeEach(() => {
        workflowExecutor = new WorkflowExecutor();
    });

    describe('executeWorkflow', () => {
        it('should execute a workflow and return a unique ID', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_world",
                "tasks": {
                    "hello_world": {
                        "output": "hello world!"
                    }
                }
            };            

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello world!");
        });
    });

    describe('executeWorkflowWithTaskThatCallsAnotherTask', () => {
        it('should execute a task that calls another task and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_name",
                "tasks": {
                    "name": {
                        "output": "Alan"
                    },
                    "hello_name": {
                        "output": "hello ${name}!"
                    }
                }
            };

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello Alan!");
        });
    });

    describe('executeWorkflowWithTaskThatCallsMultipleTasks', () => {
        it('should execute a task that calls multiple task and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_two_names",
                "tasks": {
                    "name": {
                        "output": "Alan"
                    },
                    "other_name": {
                        "output": "Bob"
                    },
                    "hello_two_names": {
                        "output": "hello ${name} and ${other_name}!"
                    }
                }
            };

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello Alan and Bob!");
        });
    });
});