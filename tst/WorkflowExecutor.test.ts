import WorkflowExecutor from '../src/services/WorkflowExecutor';
import { Workflow, Task } from '../src/types/Workflow';

describe('WorkflowExecutor', () => {
    let workflowExecutor: WorkflowExecutor;

    beforeEach(() => {
        workflowExecutor = new WorkflowExecutor();
    });

    describe('executeWorkflow', () => {
        it('should execute a workflow and return a unique ID', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_world",
                "tasks": {
                    "hello_world": {
                        "output": "hello world!"
                    }
                }
            };

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello world!");
        });
    });

    describe('executeWorkflowWithTaskThatCallsAnotherTask', () => {
        it('should execute a task that calls another task and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_name",
                "tasks": {
                    "name": {
                        "output": "Alan"
                    },
                    "hello_name": {
                        "output": "hello ${name}!"
                    }
                }
            };

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello Alan!");
        });
    });

    describe('executeWorkflowWithTaskThatCallsMultipleTasks', () => {
        it('should execute a task that calls multiple task and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_two_names",
                "tasks": {
                    "name": {
                        "output": "Alan"
                    },
                    "other_name": {
                        "output": "Bob"
                    },
                    "hello_two_names": {
                        "output": "hello ${name} and ${other_name}!"
                    }
                }
            };

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello Alan and Bob!");
        });
    });

    describe('InputContext', () => {
        it('Should be able to read from input context', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_name",
                "tasks": {
                    "hello_name": {
                        "output": "hello @{name}!"
                    }
                }
            };

            workflowExecutor.inputContext['name'] = 'Tanmay';

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello Tanmay!");
        });

        it('Should be blank if there is no input context value for a key', async () => {
            const workflow: Workflow = {
                "entry_point": "hello_name",
                "tasks": {
                    "hello_name": {
                        "output": "hello @{name}!"
                    }
                }
            };

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("hello !");
        });
    });

    describe('executeWorkflowWithWaitStep', () => {
        it('should execute a task that waits and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "slow_goodbye",
                "tasks": {
                    "slow_goodbye": {
                        "steps": [
                            {
                                "wait": 1
                            }
                        ],
                        "output": "goodbye!"
                    }
                }
            };

            const startTime = Date.now();
            const result = await workflowExecutor.executeWorkflow(workflow);
            const elapsedTime = Date.now() - startTime;

            expect(result).toBeDefined();
            expect(result).toBe("goodbye!");
            expect(elapsedTime).toBeCloseTo(1000, -3);
        });

        it('should execute concurrent wait tasks within the same period of time', async () => {
            const workflow: Workflow = {
                "entry_point": "join",
                "tasks": {
                    "slow_goodbye": {
                        "steps": [
                            {
                                "wait": 1
                            }
                        ],
                        "output": "goodbye"
                    },
                    "slow_name": {
                        "steps": [
                            {
                                "wait": 1
                            }
                        ],
                        "output": "Ada"
                    },
                    "join": {
                        "output": "${slow_goodbye} ${slow_name}!"
                    }
                }
            };

            const startTime = Date.now();
            const result = await workflowExecutor.executeWorkflow(workflow);
            const elapsedTime = Date.now() - startTime;

            expect(result).toBeDefined();
            expect(result).toBe("goodbye Ada!");
            expect(elapsedTime).toBeCloseTo(1000, -3);
        });

        it('Should throw error if wait input is not a number', async () => {
            const workflow: Workflow = {
                "entry_point": "slow_goodbye",
                "tasks": {
                    "slow_goodbye": {
                        "steps": [
                            {
                                "wait": "@{name}"
                            }
                        ],
                        "output": "goodbye!"
                    }
                }
            };

            await expect(workflowExecutor.executeWorkflow(workflow)).rejects.toThrow();
        });
    });

    describe('executeWorkflowWithLengthStep', () => {
        it('should execute a task that gets the length of a string and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "getlength",
                "tasks": {
                    "getlength": {
                        "steps": [
                            {
                                "length": "four"
                            }
                        ]
                    }
                }
            }


            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("4");
        });

        it('should throw error if length input is not a string', async () => {
            const workflow: Workflow = {
                "entry_point": "getlength",
                "tasks": {
                    "getlength": {
                        "steps": [
                            {
                                "length": 4 as unknown as string
                            }
                        ]
                    }
                }
            }

            await expect(workflowExecutor.executeWorkflow(workflow)).rejects.toThrow();
        });
    });

    describe('executeWorkflowWithGtStep', () => {
        it('should execute a task that checks if a number is greater than another number and return the correct output', async () => {
            const workflow: Workflow = {
                "entry_point": "checkgt",
                "tasks": {
                    "checkgt": {
                        "steps": [
                            {
                                "gt": [4, 3]
                            }
                        ]
                    }
                }
            }

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("true");
        });

        it('should throw error if gt input is not an array of two numbers', async () => {
            const workflow: Workflow = {
                "entry_point": "checkgt",
                "tasks": {
                    "checkgt": {
                        "steps": [
                            {
                                "gt": [4, "blah"]
                            }
                        ]
                    }
                }
            }

            await expect(workflowExecutor.executeWorkflow(workflow)).rejects.toThrow();
        });
    });

    describe('executeWorkflowWithIfStep', () => {
        it('should return true output if condition is true', async () => {
            const workflow: Workflow = {
                "entry_point": "checkif",
                "tasks": {
                    "checkif": {
                        "steps": [
                            {
                                "if": {
                                    "condition": true,
                                    "true": "yes",
                                    "false": "no"
                                }
                            }
                        ]
                    }
                }
            }

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("yes");
        });

        it('should return false output if condition is false', async () => {
            const workflow: Workflow = {
                "entry_point": "checkif",
                "tasks": {
                    "checkif": {
                        "steps": [
                            {
                                "if": {
                                    "condition": false,
                                    "true": "yes",
                                    "false": "no"
                                }
                            }
                        ]
                    }
                }
            }

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("no");
        });

        it('should throw error if if condition is not a boolean', async () => {
            const workflow: Workflow = {
                "entry_point": "checkif",
                "tasks": {
                    "checkif": {
                        "steps": [
                            {
                                "if": {
                                    "condition": "blah",
                                    "true": "yes",
                                    "false": "no"
                                }
                            }
                        ]
                    }
                }
            }

            await expect(workflowExecutor.executeWorkflow(workflow)).rejects.toThrow();
        });
    });

    describe('executeWorkflowWithMultipleSteps', () => {
        it('should execute a task with multiple steps and return the correct positive', async () => {
            const workflow: Workflow = {
                "entry_point": "multiple",
                "tasks": {
                    "multiple": {
                        "steps": [
                            {
                                "length": "four"
                            },
                            {
                                "gt": ["${0}", 3]
                            },
                            {
                                "if": {
                                    "condition": "${0}",
                                    "true": "yes",
                                    "false": "no"
                                }
                            }
                        ]
                    }
                }
            }

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("yes");
        });

        it('should execute a task with multiple steps and return the correct negative', async () => {
            const workflow: Workflow = {
                "entry_point": "multiple",
                "tasks": {
                    "multiple": {
                        "steps": [
                            {
                                "length": "four"
                            },
                            {
                                "gt": ["${0}", 5]
                            },
                            {
                                "if": {
                                    "condition": "${0}",
                                    "true": "yes",
                                    "false": "no"
                                }
                            }
                        ]
                    }
                }
            }

            const result = await workflowExecutor.executeWorkflow(workflow);

            expect(result).toBeDefined();
            expect(result).toBe("no");
        });
    });
});