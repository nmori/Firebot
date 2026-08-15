// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayRemove from "./array-remove";

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayRemove",
        description: "(非推奨: $arrayRemove を使用してください) 指定したインデックスの要素を取り除いた新しい配列を返します。",
        usage: "rawArrayRemove[array, index]",
        examples: [
            {
                usage: 'rawArrayRemove[array, 0]',
                description: "インデックス 0 の要素を取り除きます。"
            },
            {
                usage: 'rawArrayRemove[array, last]',
                description: '最後のインデックスの要素を取り除きます。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: arrayRemove.evaluator
};

export default model;