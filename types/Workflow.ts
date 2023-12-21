export type Task = {
    steps?: Task[];
    output: string;
};

export type Workflow = {
    entry_point: string;
    tasks: { 
        [key: string]: Task
    };
};

export type WorkflowContext = {
    workflow: Workflow;
    inputs: {
        [key: string]: any;
    }
};