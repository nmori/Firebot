// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayElement from './array-element';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayElement",
        description: "(非推奨: $arrayElement を使用してください) 生配列の指定したインデックスにある要素を返します。",
        usage: "rawArrayElement[array, index]",
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"],
        hidden: true
    },

    evaluator: arrayElement.evaluator
};

export default model;