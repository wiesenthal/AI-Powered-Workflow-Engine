import { Step, StepOutput, UnparsedStep } from "./Step";

export type TaskOutput = string | number | boolean;

export type WorkflowOutput = string;

export type Task = 
    | { steps: Step[] | UnparsedStep[]; output?: never }
    | { steps?: never; output: TaskOutput }
    | { steps: Step[] | UnparsedStep[]; output: TaskOutput };

export type Workflow = {
    entry_point: string;
    tasks: {
        [key: string]: Task
    };
};
