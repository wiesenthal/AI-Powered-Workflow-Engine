import WorkflowExecutor from '../src/services/WorkflowExecutor';
import { Workflow, Task, WorkflowContext } from '../types/Workflow';

describe('WorkflowExecutor', () => {
    let workflowExecutor: typeof WorkflowExecutor;

    beforeEach(() => {
        workflowExecutor = WorkflowExecutor;
    });

    afterEach(() => {
        // Clean up any created workflow contexts
        workflowExecutor['workflowContexts'].clear();
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
            expect(workflowExecutor['workflowContexts'].size).toBe(0);
            expect(result).toBe("hello world!");
        });
    });

    describe('executeTask', () => {
        it('should execute a task and return a unique ID', async () => {
            const task: Task = {
                "output": "hello bob!"
            }

            const result = await workflowExecutor.executeTask(task);

            expect(result).toBeDefined();
            expect(result).toBe("hello bob!");
        });
    });
});
