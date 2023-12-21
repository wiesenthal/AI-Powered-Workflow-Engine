import { Step } from "./Step";

export type TaskOutput = string;

export type Task = 
    | { steps: Step[]; output?: never }
    | { steps?: never; output: TaskOutput }
    | { steps: Step[]; output: TaskOutput };

export type Workflow = {
    entry_point: string;
    tasks: {
        [key: string]: Task
    };
};