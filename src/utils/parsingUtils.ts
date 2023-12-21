const taskReferenceRegex = /\${([a-zA-Z0-9_]+)}/g;

export function getTaskNameMatches(str: string): string[] {
    const matches = str.match(taskReferenceRegex);

    if (!matches) {
        return [];
    }

    return matches.map(match => match.replace(taskReferenceRegex, '$1'));
}

export function replaceTaskReferences(str: string, taskNameMatches: string[], taskOutputs: string[]): string {
    for (let i = 0; i < taskNameMatches.length; i++) {
        const match = taskNameMatches[i];
        const taskOutput = taskOutputs[i];
        
        str = str.replace(`\${${match}}`, taskOutput);
    }

    return str;
}