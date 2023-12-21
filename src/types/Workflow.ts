enum StepType {
    wait,
    length,
    gt,
    if
}

export type Step = {
    [key in StepType]: any;
};

export type Task = {
    steps?: Step[];
    output: string;
};

export type Workflow = {
    entry_point: string;
    tasks: { 
        [key: string]: Task
    };
};