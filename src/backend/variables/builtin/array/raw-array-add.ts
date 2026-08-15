// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayAdd from './array-add';

const model : ReplaceVariable = {
    definition: {
        handle: 'rawArrayAdd',
        description: '(非推奨: $arrayAdd を使用してください) 要素を追加した新しい配列を返します。',
        usage: 'rawArrayAdd[array, new-item, at-start]',
        examples: [
            {
                usage: 'rawArrayAdd[array, 4]',
                description: '4 を生配列の末尾に追加した新しい配列を返します。'
            },
            {
                usage: 'rawArrayAdd[array, 4, true]',
                description: '4 を生配列の先頭に追加した新しい配列を返します。'
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },

    evaluator: arrayAdd.evaluator
};

export default model;