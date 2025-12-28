import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import readApi from './api-read';

const model: ReplaceVariable = {
    definition: {
        handle: "rawReadApi",
        usage: "rawReadApi[url]",
        description: '(非推奨: $readApi を使用してください) 指定した URL にアクセスし、レスポンスをオブジェクトとして返します。',
        examples: [
            {
                usage: 'rawReadApi[url, object.path.here]',
                description: "JSON レスポンスオブジェクトを辿ります。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"],
        hidden: true
    },
    evaluator: (
        trigger: Trigger,
        ...args: unknown[]
    ) : unknown => {
        return readApi.evaluator(trigger, ...args);
    }
};

export default model;