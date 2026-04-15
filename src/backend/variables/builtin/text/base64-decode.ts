import type { ReplaceVariable } from "../../../../types/variables";

import logger from '../../../logwrapper';
import { stringify } from '../../../utils';

const model: ReplaceVariable = {
    definition: {
        handle: 'base64Decode',
        usage: 'base64Decode[string]',
        description: 'Base64 エンコードされた文字列をデコードします。有効な Base64 でない場合は空文字列を返します。',
        examples: [
            {
                usage: 'base64Decode[SGVsbG8sIFdvcmxkIQ==]',
                description: 'Base64 文字列 "SGVsbG8sIFdvcmxkIQ==" を "Hello, World!" にデコードします。'
            },
            {
                usage: 'base64Decode[test string]',
                description: '"test string" は有効な Base64 ではないため、空文字列を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (_, text: unknown): string => {
        const decoder = new TextDecoder();
        try {
            return decoder.decode(Uint8Array.from(atob(stringify(text)), c => c.charCodeAt(0)));
        } catch {
            logger.error(`Failed to decode base64 string: ${stringify(text)}`);
            return "";
        }
    }
};

export default model;
