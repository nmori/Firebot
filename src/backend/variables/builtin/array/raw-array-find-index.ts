// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayFindIndex from './array-find-index';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayFindIndex",
        description: "(非推奨: $arrayFindIndex を使用してください) 配列内で一致する要素を探し、そのインデックスを返します。見つからない場合は null を返します。",
        usage: "rawArrayFindIndex[array, matcher, propertyPath]",

        examples: [
            {
                usage: 'rawArrayFindIndex[array, b]',
                description: '"b" のインデックスである 1 を返します。'
            },
            {
                usage: 'rawArrayFindIndex[array, value, key]',
                description: 'key プロパティが "value" である要素を配列から探します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"],
        hidden: true
    },
    evaluator: arrayFindIndex.evaluator
};
export default model;