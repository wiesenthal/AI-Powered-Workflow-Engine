import fs from 'fs';
import { Workflow } from '../types/Workflow';

export function loadWorkflow(name: string): Workflow {
    const filePath = `workflows/${name}.json`;
    if (!fs.existsSync(filePath)) {
        throw new Error(`Workflow ${name} not found`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const workflow = JSON.parse(fileContent) as Workflow;

    return workflow;
}

export function listAvailableWorkflows(): string[] {
    const files = fs.readdirSync('workflows');
    const workflowNames = files.map(file => file.split('.')[0]);
    
    // sort to show 'Step ' workflows first, then alphabetically
    workflowNames.sort((a, b) => {
        if (a.startsWith('Step') && !b.startsWith('Step')) {
            return -1;
        }
        if (!a.startsWith('Step') && b.startsWith('Step')) {
            return 1;
        }
        return a.localeCompare(b);
    });
    return workflowNames;
}
