import fs from 'fs';
import { Workflow } from '../types/Workflow';
import { Step } from '../types/Step';

const WORKFLOW_FOLDER_PATH = 'workflows';

export function loadWorkflow(name: string): Workflow {
    const filePath = `${WORKFLOW_FOLDER_PATH}/${name}.json`;
    if (!fs.existsSync(filePath)) {
        throw new Error(`Workflow ${name} not found`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const workflow = JSON.parse(fileContent) as Workflow;

    return workflow;
}

export function listAvailableWorkflows(): string[] {
    const files = fs.readdirSync(WORKFLOW_FOLDER_PATH);
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

const STEP_DATA_FOLDER_PATH = "stepData";

type StepName = string;
type Example = string;
type TypeDefinition = string;
type Code = string;

type stepOrigin = "basic" | "generated";

export const loadStepDef = (
    fileName: string,
    stepOrigin: stepOrigin
): [Example, TypeDefinition, Code] => {
    const basicFolderPath = `${STEP_DATA_FOLDER_PATH}/${stepOrigin}/${fileName}`;

    if (!fs.existsSync(basicFolderPath)) {
        throw new Error(`Basic step ${fileName} not found`);
    }

    const fileContent = fs.readFileSync(basicFolderPath, 'utf-8');
    const splitText = fileContent.split('//#SPLIT#//');
    
    if (splitText.length !== 3) {
        throw new Error(`Basic step ${fileName} is not formatted correctly`);
    }
    
    return [splitText[0], splitText[1], splitText[2]];
}

export const loadBasicStepDefs = (): [StepName, Example, TypeDefinition, Code][] => {
    const origin: stepOrigin = "basic";
    const basicFolderPath = `${STEP_DATA_FOLDER_PATH}/${origin}`;

    if (!fs.existsSync(basicFolderPath)) {
        throw new Error(`Basic step folder not found`);
    }

    const files = fs.readdirSync(basicFolderPath);

    return files.map(file => {
        const [example, typeDef, executorCode] = loadStepDef(file, origin);
        const stepName = file.split('.')[0];
        return [stepName, example, typeDef, executorCode];
    });
}

// This function would be for using generated steps for ICL prompting
export const loadGeneratedStepDefs = (): [StepName, Example, TypeDefinition, Code][] => {
    const origin: stepOrigin = "generated";
    const aiFolderPath = `${STEP_DATA_FOLDER_PATH}/${origin}}`;

    if (!fs.existsSync(aiFolderPath)) {
        throw new Error(`Generated step folder not found`);
    }

    const files = fs.readdirSync(aiFolderPath);

    files.filter(file => file.endsWith('.txt'));

    return files.map(file => {
        const [example, typeDef, executorCode] = loadStepDef(file, origin);
        const stepName = file.split('.')[0];
        return [stepName, example, typeDef, executorCode];
    });
}

export const loadGeneratedExecutorCodes = (): [StepName, Code][] => {
    const origin: stepOrigin = "generated";

    const aiFolderPath = `${STEP_DATA_FOLDER_PATH}/${origin}`;

    if (!fs.existsSync(aiFolderPath)) {
        throw new Error(`Generated step folder not found`);
    }

    const files = fs.readdirSync(aiFolderPath);

    files.filter(file => file.endsWith('.js'));

    return files.map(file => {
        const executorCode = fs.readFileSync(`${aiFolderPath}/${file}`, 'utf-8');
        const stepName = file.split('.')[0];
        return [stepName, executorCode];
    });
}

export const saveAICode = (
    stepName: string, 
    example: string | Step,
    jsCode: string,
    tsCode: string, 
    typeDef: string): void => {
    const destination: stepOrigin = "generated";
    const aiFolderPath = `${STEP_DATA_FOLDER_PATH}/${destination}`;

    if (!fs.existsSync(aiFolderPath)) {
        fs.mkdirSync(aiFolderPath);
    }

    const exampleString = typeof example === 'string' ? example : JSON.stringify(example, null, 4);

    const stepOutputTypeDef = `type StepOutput = string | number | boolean;`;

    const typeDefAndCode = `type Step = ${typeDef}\n\n${stepOutputTypeDef}\n\n${tsCode}`;

    // Below is for executing code
    fs.writeFileSync(`${aiFolderPath}/${stepName}.js`, jsCode);
    // Below is human readable
    fs.writeFileSync(`${aiFolderPath}/${stepName}.ts`, typeDefAndCode);
    // Below would be for using generated steps for ICL prompting
    fs.writeFileSync(`${aiFolderPath}/${stepName}.txt`, `${exampleString}\n\n//#SPLIT#//\n\n${typeDefAndCode}\n\n//#SPLIT#//\n\n${jsCode}`);
}
