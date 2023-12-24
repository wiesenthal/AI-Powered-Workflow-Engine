import fs from 'fs';
import { loadBasicStepDefs, loadStepDef, loadWorkflow } from '../src/utils/fileUtils';

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

describe('loadBasicStepDefs', () => {
    it('should load the step definition for wait', () => {
        
        const [example, typeDef, executorCode] = loadStepDef('wait.txt', 'basic');
        
        expect(example).toBe(`{
    "wait": 5
}
`);

        expect(typeDef).toBe(`
type Step = {
    wait: number
};

type StepOutput = string | number | boolean;
`
        );
        expect(executorCode).toBe(`
const execute = async (step: Step): Promise<StepOutput> => {
    const waitTime = step.wait;

    if (typeof waitTime !== 'number') {
        throw new Error('Wait time must be a number');
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(waitTime);
        }, waitTime * 1000);
    });
};
`
        );
    });
});

describe ('loadAllBasicStepDefs', () => {
    it('should load all basic step definitions', () => {
        const stepDefs = loadBasicStepDefs();

        expect(stepDefs.length).toBe(4);
    });

    it('should have the first step definition be for gt', () => {
        const stepDefs = loadBasicStepDefs();

        expect(stepDefs[0][0]).toBe('gt');

        expect(stepDefs[0][1]).toBe(`{
    "gt": [
        7,
        6
    ]
}
`    );

        expect(stepDefs[0][2]).toBe(`
type Step = {
    gt: [number, number]
};

type StepOutput = string | number | boolean;
`       );

        expect(stepDefs[0][3]).toBe(`
const execute = async (step: Step): Promise<StepOutput> => {
    const [a, b] = step.gt;

    if (typeof a !== 'number' || typeof b !== 'number') {
        const aNum = Number(a);
        const bNum = Number(b);
        if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
            throw new Error('Gt values must be valid numbers');
        }

        return aNum > bNum;
    }

    return a > b;
};
`       );
    });
});
