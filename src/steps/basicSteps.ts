import { Step, StepOutput } from "../types/Step";

export type WaitStep = {
    wait: number
}

export const executeWaitStep = async (step: Step): Promise<StepOutput> => {
    const waitTime = (step as WaitStep).wait;

    if (typeof waitTime !== 'number') {
        throw new Error('Wait time must be a number');
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(waitTime);
        }, waitTime * 1000);
    });
};

export type LengthStep = {
    length: string
}

export const executeLengthStep = async (step: Step): Promise<number> => {
    const str = (step as LengthStep).length;

    if (typeof str !== 'string') {
        throw new Error('Length value must be a string');
    }

    return str.length;
};

export type GtStep = {
    gt: [number, number]
}

export const executeGtStep = async (step: Step): Promise<boolean> => {
    const [a, b] = (step as GtStep).gt;

    if (typeof a !== 'number' || typeof b !== 'number') {
        try {
            const aNum = Number(a);
            const bNum = Number(b);
            if (typeof aNum === 'number' && typeof bNum === 'number') {
                return aNum > bNum;
            }
        }
        catch (e) {
            throw new Error(`Gt values must be numbers. a: ${a}, b: ${b}`);
        }
    }

    return a > b;
};

export type IfStep = {
    if: {
        condition: boolean
        true: any
        false: any
    }
}

export const executeIfStep = async (step: Step): Promise<StepOutput> => {
    const value = (step as IfStep).if;

    if (typeof value.condition !== 'boolean') {
        throw new Error('If condition must be a boolean');
    }

    return value.condition ?
        await value.true
        :
        await value.false;
};
