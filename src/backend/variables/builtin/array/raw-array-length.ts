// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayLength from './array-length';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayLength",
        description: "(非推奨: $arrayLength を使用してください) 配列の長さを返します。",
        usage: "rawArrayLength[array]",
        categories: ["advanced", "numbers"],
        possibleDataOutput: ["number"],
        hidden: true
    },
    evaluator: arrayLength.evaluator
};

export default model;