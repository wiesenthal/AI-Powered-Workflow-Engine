import { stepTypeToString } from "../src/utils/typeStringifyUtils";
import { UnparsedStep } from "../src/types/Step";

describe('typeStringifyUtils', () => {
    it('should stringify a wait', () => {
        const step: UnparsedStep = {"wait": 1};
        const result = stepTypeToString(step);
        expect(result).toBe(
        `{\n    wait: number\n}`
        );
    });

    it('should stringify a length', () => {
        const step: UnparsedStep = {"length": "string"};
        const result = stepTypeToString(step);
        expect(result).toBe(
        `{\n    length: string\n}`
        );
    });

    it('should stringify a gt', () => {
        const step: UnparsedStep = {"gt": [1, 2]};
        const result = stepTypeToString(step);
        expect(result).toBe(
        `{\n    gt: [\n        number,\n        number\n    ]\n}`
        );
    });

    it('should stringify an if', () => {
        const step: UnparsedStep = {"if": {
                        "condition": "${0}",
                        "true": "long name",
                        "false": "short name"
                    }};
        const result = stepTypeToString(step);
        expect(result).toBe(
        `{\n    if: {\n        condition: string,\n        true: string,\n        false: string\n    }\n}`
        );
    });
});
