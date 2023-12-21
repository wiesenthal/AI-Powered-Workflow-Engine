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
const uuid_1 = require("uuid");
class WorkflowExecutor {
    constructor() {
        this.workflowContexts = new Map();
    }
    executeWorkflow(workflow) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflowId = (0, uuid_1.v4)();
            this.workflowContexts.set(workflowId, {
                workflow,
                inputs: {}
            });
            const entryPoint = workflow.entry_point;
            const tasks = workflow.tasks;
            if (!entryPoint || !tasks || !tasks[entryPoint]) {
                throw new Error('Invalid workflow format');
            }
            console.log(`Executing workflow ${workflowId} with entry point ${entryPoint}`);
            const output = yield this.executeTask(tasks[entryPoint]);
            console.log(`Workflow ${workflowId} executed, output: ${output}`);
            this.workflowContexts.delete(workflowId);
            return output;
        });
    }
    executeTask(task, arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!task) {
                throw new Error('Invalid task format');
            }
            console.log(`Executing task ${JSON.stringify(task)}`);
            if (task.steps) {
                let previousStepOutput = undefined;
                task.steps.forEach((step) => __awaiter(this, void 0, void 0, function* () {
                    console.log(`Executing step ${JSON.stringify(step)}`);
                    previousStepOutput = yield this.executeTask(step, previousStepOutput);
                }));
            }
            return task.output;
        });
    }
}
exports.default = new WorkflowExecutor();
