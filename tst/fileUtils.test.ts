
describe('loadWorkflow', () => {
    it('should load the workflow file if it exists', () => {
        // Mock the fs.existsSync function to return true
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);

        // Mock the fs.readFileSync function to return a sample workflow
        jest.spyOn(fs, 'readFileSync').mockReturnValue(
            JSON.stringify({
                name: 'Sample Workflow',
                steps: ['Step 1', 'Step 2', 'Step 3'],
            })
        );

        const workflow = loadWorkflow('sample');

        expect(workflow).toEqual({
            name: 'Sample Workflow',
            steps: ['Step 1', 'Step 2', 'Step 3'],
        });

        // Restore the original implementations of fs.existsSync and fs.readFileSync
        jest.restoreAllMocks();
    });

    it('should throw an error if the workflow file does not exist', () => {
        // Mock the fs.existsSync function to return false
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);

        expect(() => {
            loadWorkflow('nonexistent');
        }).toThrow('Workflow nonexistent not found');

        // Restore the original implementation of fs.existsSync
        jest.restoreAllMocks();
    });
});
import fs from 'fs';
import { loadWorkflow } from '../src/utils/fileUtils';
