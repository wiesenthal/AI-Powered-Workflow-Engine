
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
});
import { getTaskNameMatches, replaceTaskReferences } from '../src/utils/parsingUtils';
