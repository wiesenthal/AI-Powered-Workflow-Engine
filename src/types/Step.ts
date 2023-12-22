type UnionToIntersection<U> = 
    (U extends any ? (k: U) => void : never) extends 
    ((k: infer I) => void) ? I : never;

type ExtractKeys<T> = T extends T ? keyof T : never;

export type WaitStep = {
    wait: number
}

export type LengthStep = {
    length: string
}

export type GtStep = {
    gt: [number, number]
}

export type IfStep = {
    if: {
        condition: boolean
        true: any
        false: any
    }
}

export type Step = WaitStep | LengthStep | GtStep | IfStep;

export type StepOutput = string | number | boolean;

export type UnparsedWaitStep = {
    wait: string | number
}

export type UnparsedLengthStep = {
    length: string
}

export type UnparsedGtStep = {
    gt: [string | number, string | number]
}

export type UnparsedIfStep = {
    if: {
        condition: string | boolean
        true: StepOutput
        false: StepOutput
    }
}

export type UnparsedStep = UnparsedWaitStep | UnparsedLengthStep | UnparsedGtStep | UnparsedIfStep;