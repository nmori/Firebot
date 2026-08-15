import type { ReplaceVariable } from "../../../../types/variables";

import arrayFilter from './array-filter';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayFilter",
        description: "(非推奨: $arrayFilter を使用してください) 絞り込んだ新しい生配列を返します。",
        usage: "rawArrayFilter[rawArray, matcher, propertyPath, removeMatches]",
        examples: [
            {
                usage: 'rawArrayFilter[rawArray, 1, null, false]',
                description: "1 と等しくない要素を除外します。"
            },
            {
                usage: 'rawArrayFilter[rawArray, 1, null, true]',
                description: '1 と等しい要素を除外します。'
            },
            {
                usage: 'rawArrayFilter[rawArray, value, key, true]',
                description: '配列内で key プロパティが "value" と等しい要素を除外します。'
            }
        ],

        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: arrayFilter.evaluator
};

export default model;