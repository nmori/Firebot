// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayReverse from './array-reverse';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayReverse",
        description: "(非推奨: $arrayReverse を使用してください) 順序を逆にした新しい配列を返します。",
        usage: "rawArrayReverse[array]",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: arrayReverse.evaluator
};

export default model;