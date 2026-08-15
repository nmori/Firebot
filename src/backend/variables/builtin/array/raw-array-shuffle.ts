// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayShuffle from './array-shuffle';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayShuffle",
        description: "(非推奨: $arrayShuffle を使用してください) シャッフルした新しい配列を返します。",
        usage: "rawArrayShuffle[array]",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: arrayShuffle.evaluator
};

export default model;