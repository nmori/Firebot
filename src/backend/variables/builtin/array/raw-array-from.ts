import type { ReplaceVariable } from "../../../../types/variables";

import arrayFrom from './array-from';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayFrom",
        description: "(非推奨: $arrayFrom を使用してください) 指定した値を含む生配列を返します。",
        usage: "rawArrayFrom[value, value, ...]",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: arrayFrom.evaluator
};

export default model;