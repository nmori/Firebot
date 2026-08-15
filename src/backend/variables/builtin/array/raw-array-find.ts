// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayFind from './array-find';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayFind",
        description: "(非推奨: $arrayFind を使用してください) 配列内で一致する要素を返します。見つからない場合は null を返します。",
        usage: "rawArrayFind[array, matcher, propertyPath]",
        examples: [
            {
                usage: 'rawArrayFind[array, value]',
                description: '配列の各要素から "value" を探し、最初に一致した要素を返します。'
            },
            {
                usage: 'rawArrayFind[array, value, key]',
                description: '配列から "key" プロパティが "value" と等しい要素を探します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"],
        hidden: true
    },

    evaluator: arrayFind.evaluator
};

export default model;