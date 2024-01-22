import { InputContext } from "../src/types/InputContext";
import { Workflow } from "../src/types/Workflow";
import { parseTaskOutput, parseOutputForInputs, parseOutputForTaskNames, getMatches, replaceReferences } from "../src/utils/parsingUtils";

describe('parsingUtils', () => {
    describe('getMatches', () => {
        it('should return an array of task name matches', () => {
            const str = 'Hello ${world}! I am ${miles}.';
            const expectedMatches = [
                { key: 'world', match: '${world}' },
                { key: 'miles', match: '${miles}' }
            ]

            const taskNameMatches = getMatches(str, /\${(.*?)}/g);

            expect(taskNameMatches).toEqual(expectedMatches);
        });

        it('should return an empty array if no task name matches found', () => {
            const str = 'Hello world!';

            const taskNameMatches = getMatches(str, /\${(.*?)}/g);

            expect(taskNameMatches).toEqual([]);
        });
    });

    describe('replaceTaskReferences', () => {
        it('should replace task references with task outputs', () => {
            const str = 'Hello ${world}! I am ${miles}.';
            const taskNameMatches = [
                { key: 'world', match: '${world}' },
                { key: 'miles', match: '${miles}' }
            ]
            const taskOutputs = {
                "world": "Universe",
                "miles": "Miles"
            }
            const expectedOutput = 'Hello Universe! I am Miles.';

            const result = replaceReferences(str, taskNameMatches, taskOutputs);

            expect(result).toEqual(expectedOutput);
        });
    });

    describe('getInputMatches', () => {
        it('should return an array of input matches', () => {
            const str = 'Hello @{world}! I am @{miles}.';
            const expectedMatches = [
                { key: 'world', match: '@{world}' },
                { key: 'miles', match: '@{miles}' }
            ]

            const inputMatches = getMatches(str, /@\{(.*?)\}/g);

            expect(inputMatches).toEqual(expectedMatches);
        });

        it('should return an empty array if no input matches found', () => {
            const str = 'Hello world!';

            const inputMatches = getMatches(str, /@\{(.*?)\}/g);

            expect(inputMatches).toEqual([]);
        });
    });

    describe('replaceInputReferences', () => {
        it('should replace input references with input values', () => {
            const str = 'Hello @{world}! I am @{miles}.';
            const inputMatches = [
                { key: 'world', match: '@{world}' },
                { key: 'miles', match: '@{miles}' }
            ]
            const inputContext = {
                "world": "Universe",
                "miles": "Miles"
            }
            const expectedOutput = 'Hello Universe! I am Miles.';

            const result = replaceReferences(str, inputMatches, inputContext);

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