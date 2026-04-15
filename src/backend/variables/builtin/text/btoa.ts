import type { ReplaceVariable } from "../../../../types/variables";
import base64Encode from '../text/base64-encode';

const model: ReplaceVariable = {
    definition: {
        handle: 'btoa',
        usage: 'btoa[string]',
        description: '文字列を Base64 形式にエンコードします。',
        examples: [
            {
                usage: 'btoa["Hello, World!"]',
                description: '"Hello, World!" を Base64 エンコードします（結果: "SGVsbG8sIFdvcmxkIQ=="）。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: base64Encode.evaluator
};

export default model;
