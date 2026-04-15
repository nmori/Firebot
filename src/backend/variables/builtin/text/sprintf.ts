import { sprintf } from 'sprintf-js';
import type { ReplaceVariable } from "../../../../types/variables";
import { stringify } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: 'sprintf',
        usage: 'sprintf[template, ...values]',
        description: '指定したテンプレートと値で文字列をフォーマットします。',
        examples: [
            {
                usage: 'sprintf["Hello, %s!", "World"]',
                description: '"Hello, World!" にフォーマットします。'
            },
            {
                usage: 'sprintf["%d + %d = %d", 2, 3, 5]',
                description: '"2 + 3 = 5" にフォーマットします。'
            },
            {
                usage: 'sprintf["%s tipped $%0.2f", "Alice", 5]',
                description: '"Alice tipped $5.00" にフォーマットします。'
            }
        ],
        categories: ["text"],
        possibleDataOutput: ["text"]
    },
    evaluator: (_, template: unknown, ...args: unknown[]): string => {
        return sprintf(stringify(template), ...args);
    }
};

export default model;
