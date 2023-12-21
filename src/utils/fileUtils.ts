import fs from 'fs';
import { Workflow } from '../../types/Workflow';

export function loadWorkflow(name: string): Workflow {
    const filePath = `workflows/${name}.json`;
    if (!fs.existsSync(filePath)) {
        throw new Error(`Workflow ${name} not found`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const workflow = JSON.parse(fileContent) as Workflow;

    return workflow;
}