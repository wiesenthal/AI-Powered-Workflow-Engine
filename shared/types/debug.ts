import { Step, StepOutput, StepValue, UnparsedStep } from "../../src/types/Step";
import { TaskOutput } from "../../src/types/Workflow";
import { SharedError } from "./error";

export type DebugOutput = {
    task?: string;
    step?: number | 'output';
    unparsed?: StepValue | TaskOutput;
    command?: keyof Step;
    result?: any;
    error?: SharedError;
    completedWorkflow?: string; // indicates a workflow has completed so the client can create a line break
}
