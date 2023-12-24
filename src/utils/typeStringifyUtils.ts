import { UnparsedStep, UnparsedStepValue } from "../types/Step";

const TAB: string = '    ';

const stepValueToString = (
    value: UnparsedStepValue,
    tabDepth: number = 1
): string => {
    const indent = TAB.repeat(tabDepth);
    const deepIndent = TAB.repeat(tabDepth + 1);
    const nextDepth = tabDepth + 1;

    let valueTypeString: string = "";
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        valueTypeString = typeof value;
    } else if (Array.isArray(value)) {
        valueTypeString = "[\n"
        const numValues = value.length;
        for (let i = 0; i < numValues; i++) {
            const v = value[i];
            valueTypeString += `${deepIndent}${stepValueToString(v, nextDepth)}${i < numValues - 1 ? "," : ""}\n`;
        }
        valueTypeString += `${indent}]`;
    } else if (typeof value === 'object') {
        valueTypeString = "{\n";
        const numKeys = Object.keys(value).length;
        for (let i = 0; i < numKeys; i++) {
            const key = Object.keys(value)[i];
            valueTypeString += `${deepIndent}${key}: ${stepValueToString(value[key], nextDepth)}${i < numKeys - 1 ? "," : ""}\n`;
        }
        valueTypeString += `${indent}}`;
    } else {
        valueTypeString = typeof value;
    }

    return valueTypeString;
};

export const stepTypeToString = (step: UnparsedStep): string => {
    let key = Object.keys(step)[0] as string;
    let value = step[key];

    const valueTypeString = stepValueToString(value);

    const typeString = `{\n${TAB}${key}: ${valueTypeString}\n}`;

    return typeString;
};