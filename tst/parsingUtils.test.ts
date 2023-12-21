import { InputContext } from "../src/types/InputContext";
import { Workflow } from "../src/types/Workflow";
import { getInputMatches, getTaskNameMatches, parseTaskOutput, parseOutputForInputs, parseOutputForTaskNames, replaceInputReferences, replaceTaskReferences } from "../src/utils/parsingUtils";

describe('parsingUtils', () => {
    describe('getTaskNameMatches', () => {
        it('should return an array of task name matches', () => {
            const str = 'Hello ${world}! I am ${copilot}.';
            const expectedMatches = ['world', 'copilot'];

            const taskNameMatches = getTaskNameMatches(str);

            expect(taskNameMatches).toEqual(expectedMatches);
        });

        it('should return an empty array if no task name matches found', () => {
            const str = 'Hello world!';

            const taskNameMatches = getTaskNameMatches(str);

            expect(taskNameMatches).toEqual([]);
        });
    });

    describe('replaceTaskReferences', () => {
        it('should replace task references with task outputs', () => {
            const str = 'Hello ${world}! I am ${copilot}.';
            const taskNameMatches = ['world', 'copilot'];
            const taskOutputs = ['GitHub', 'Copilot'];
            const expectedOutput = 'Hello GitHub! I am Copilot.';

            const result = replaceTaskReferences(str, taskNameMatches, taskOutputs);

            expect(result).toEqual(expectedOutput);
        });
    });

    describe('getInputMatches', () => {
        it('should return an array of input matches', () => {
            const str = 'Hello @{world}! I am @{copilot}.';
            const expectedMatches = ['world', 'copilot'];

            const inputMatches = getInputMatches(str);

            expect(inputMatches).toEqual(expectedMatches);
        });

        it('should return an empty array if no input matches found', () => {
            const str = 'Hello world!';

            const inputMatches = getInputMatches(str);

            expect(inputMatches).toEqual([]);
        });
    });

    describe('replaceInputReferences', () => {
        it('should replace input references with input values', () => {
            const str = 'Hello @{world}! I am @{copilot}.';
            const inputMatches = ['world', 'copilot'];
            const inputValues = ['GitHub', 'Copilot'];
            const expectedOutput = 'Hello GitHub! I am Copilot.';

            const result = replaceInputReferences(str, inputMatches, inputValues);

            expect(result).toEqual(expectedOutput);
        });
    });

    describe('parseTaskOutputForTaskNames', () => {
        it('should parse task output for task names', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_world",
                "tasks": {
                    "name": {
                        "output": "Alan"
                    },
                }
            };
            const inputContext: InputContext = {};

            const result = await parseOutputForTaskNames("Hello ${name}!", workflow, inputContext);

            expect(result).toEqual('Hello Alan!');
        });
    });

    describe('parseTaskOutputForInputs', () => {
        it('should parse task output for inputs', () => {
            const inputContext: InputContext = {
                "val": "thisval"
            };

            const result = parseOutputForInputs("value is @{val}", inputContext);

            expect(result).toEqual('value is thisval');
        });
    });

    describe('parseTaskOutput', () => {
        it('should parse task output for inputs and task names', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_world",
                "tasks": {
                    "name": {
                        "output": "Alan"
                    },
                }
            };
            const inputContext: InputContext = {
                "val": "thisval"
            };

            const result = await parseTaskOutput("Hello ${name}! value is @{val}", workflow, inputContext);

            expect(result).toEqual('Hello Alan! value is thisval');
        });
    });
});