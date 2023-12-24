type Step = {
    add: [
        string,
        string
    ]
}
type StepOutput = string | number | boolean;



const execute = async (step: Step): Promise<StepOutput> => {
    const [a, b] = step.add;

    if (typeof a !== 'string' || typeof b !== 'string') {
        throw new Error('Add values must be strings');
    }

    const aNum = Number(a);
    const bNum = Number(b);

    if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
        throw new Error('Add values must be valid numbers');
    }

    return aNum + bNum;
};
