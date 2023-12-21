"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parsingUtils_1 = require("../utils/parsingUtils");
class WorkflowExecutor {
    constructor() {
        this.workflowContexts = new Map();
    }
    executeWorkflow(workflow) {
        return __awaiter(this, void 0, void 0, function* () {
            const entryPoint = workflow.entry_point;
            const tasks = workflow.tasks;
            if (!entryPoint || !tasks || !tasks[entryPoint]) {
                throw new Error('Invalid workflow format');
            }
            const workflowContext = {
                workflow,
                inputs: {}
            };
            console.log(`Executing workflow with entry point ${entryPoint}`);
            const output = yield this.executeTask(tasks[entryPoint], workflowContext);
            console.log(`Workflow executed, output: ${output}`);
            return output;
        });
    }
    executeTask(task, workflowContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!task) {
                throw new Error('Invalid task format');
            }
            console.log(`Executing task ${JSON.stringify(task)}`);
            if (task.steps) {
                let previousStepOutput = undefined;
                task.steps.forEach((step) => __awaiter(this, void 0, void 0, function* () {
                    console.log(`Executing step ${JSON.stringify(step)}`);
                    previousStepOutput = yield this.executeStep(step, previousStepOutput);
                }));
            }
            let output = task.output;
            const taskNameMatches = (0, parsingUtils_1.getTaskNameMatches)(output);
            if (taskNameMatches) {
                const tasksReferenced = taskNameMatches.map((taskReferenceMatch) => workflowContext.workflow.tasks[taskReferenceMatch]);
                const tasksReferencedOutputs = yield Promise.all(tasksReferenced.map((taskReferenced) => __awaiter(this, void 0, void 0, function* () { return yield this.executeTask(taskReferenced, workflowContext); })));
                output = (0, parsingUtils_1.replaceTaskReferences)(output, taskNameMatches, tasksReferencedOutputs);
            }
            return output;
        });
    }
    executeStep(step, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
            if (!step) {
                throw new Error('Invalid step format');
            }
            const stepType = Object.keys(step)[0];
            // switch (stepType) {
            //     case 'wait':
            //         return this.executeWaitStep(step);
            //     case 'length':
            //         return this.executeLengthStep(step, arg);
            //     case 'gt':
            //         return this.executeGtStep(step, arg);
            //     case 'if':
            //         return this.executeIfStep(step, arg);
            //     default:
            //         throw new Error(`Invalid step type ${stepType}`);
            // }
        });
    }
}
exports.default = new WorkflowExecutor();
