// Deprecated
import type { ReplaceVariable } from "../../../../types/variables";

import arrayJoin from './array-join';

const model : ReplaceVariable = {
    definition: {
        handle: "rawArrayJoin",
        description: "(非推奨: $arrayJoin を使用してください) 配列の各要素を指定した区切り文字で連結した文字列を返します。",
        usage: "rawArrayJoin[array, separator]",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: arrayJoin.evaluator
};

export default model;