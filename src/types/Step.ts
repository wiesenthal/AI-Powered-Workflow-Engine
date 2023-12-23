export type StepOutput = string | number | boolean;

export type StepValue = StepOutput | Step | Array<StepValue>;

export type Step = {
    [key: string]: StepValue
}

export type UnparsedStepValue = StepOutput | UnparsedStep | Array<UnparsedStepValue>;

export type UnparsedStep = {
    [key: string]: UnparsedStepValue
}
