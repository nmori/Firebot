import type { ReplaceVariable } from "../../../../types/variables";

import { stringify } from '../../../utils';

const model: ReplaceVariable = {
    definition: {
        handle: 'base64Encode',
        usage: 'base64Encode[string]',
        description: '文字列を Base64 形式にエンコードします。',
        examples: [
            {
                usage: 'base64Encode["Hello, World!"]',
                description: '"Hello, World!" を Base64 エンコードします（結果: "SGVsbG8sIFdvcmxkIQ=="）。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (_, text: unknown): string => {
        const encoder = new TextEncoder();
        return btoa(String.fromCharCode(...encoder.encode(stringify(text))));
    }
};

export default model;
