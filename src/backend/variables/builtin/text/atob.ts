import type { ReplaceVariable } from "../../../../types/variables";
import base64Decode from './base64-decode';

const model: ReplaceVariable = {
    definition: {
        handle: 'atob',
        usage: 'atob[string]',
        description: 'Base64 エンコードされた文字列をデコードします。有効な Base64 でない場合は空文字列を返します。',
        examples: [
            {
                usage: 'atob[SGVsbG8sIFdvcmxkIQ==]',
                description: 'Base64 文字列 "SGVsbG8sIFdvcmxkIQ==" を "Hello, World!" にデコードします。'
            },
            {
                usage: 'atob[test string]',
                description: '"test string" は有効な Base64 ではないため、空文字列を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: base64Decode.evaluator
};

export default model;
