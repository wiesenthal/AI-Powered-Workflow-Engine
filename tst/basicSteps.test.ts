import { executeLengthStep, executeGtStep, executeIfStep, executeWaitStep, WaitStep } from '../src/steps/basicSteps';
import { Step } from '../src/types/Step';

describe('executeWaitStep', () => {
    it('should resolve after the specified wait time', async () => {
        const step: WaitStep = { wait: 1 };
        const startTime = Date.now();
        const result = await executeWaitStep(step as Step);
        const elapsedTime = Date.now() - startTime;

        expect(result).toBe(1);
        expect(elapsedTime).toBeCloseTo(1000, -2); // allow 10ms tolerance
    });

    it('should throw an error if wait time is not a number', async () => {
        const step: Step = { wait: 'not a number' } as any;

        await expect(executeWaitStep(step)).rejects.toThrow('Wait time must be a number');
    });
});

describe('executeLengthStep', () => {
    it('should return the length of the string', async () => {
        const step: Step = { length: 'abc' };

        const result = await executeLengthStep(step);

        expect(result).toBe(3);
    });

    it('should throw an error if length value is not a string', async () => {
        const step: Step = { length: 123 } as any;

        await expect(executeLengthStep(step)).rejects.toThrow('Length value must be a string');
    });
});

describe('executeGtStep', () => {
    it('should return true if a > b', async () => {
        const step: Step = { gt: [2, 1] };

        const result = await executeGtStep(step);

        expect(result).toBe(true);
    });

    it('should return false if a < b', async () => {
        const step: Step = { gt: [1, 2] };

        const result = await executeGtStep(step);

        expect(result).toBe(false);
    });

    it('should return false if a === b', async () => {
        const step: Step = { gt: [1, 1] };

        const result = await executeGtStep(step);

        expect(result).toBe(false);
    });
});

describe('executeIfStep', () => {
    it('should return true if condition is true', async () => {
        const step: Step = { if: { condition: true, true: 1, false: 2 } };

        const result = await executeIfStep(step);

        expect(result).toBe(1);
    });

    it('should return false if condition is false', async () => {
        const step: Step = { if: { condition: false, true: 1, false: 2 } };

        const result = await executeIfStep(step);

        expect(result).toBe(2);
    });

    it('should throw an error if condition is not a boolean', async () => {
        const step: Step = { if: { condition: 'not a boolean', true: 1, false: 2 } } as any;

        await expect(executeIfStep(step)).rejects.toThrow('If condition must be a boolean');
    });
});