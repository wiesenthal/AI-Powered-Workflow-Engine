import { Step, StepOutput, UnparsedStep } from "../../src/types/Step";
import { TaskOutput } from "../../src/types/Workflow";
import { SharedError } from "./error";

export type DebugOutput = {
    task?: string;
    step?: number | 'output';
    unparsed?: TaskOutput | StepOutput;
    command?: keyof Step;
    result?: any;
    error?: SharedError;
    completedWorkflow?: string; // indicates a workflow has completed so the client can create a line break
}
