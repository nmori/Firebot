import type { ReplaceVariable } from "../../../../types/variables";

import objectWalkPath from './object-walk-path';

const model : ReplaceVariable = {
    definition: {
        handle: "rawObjectWalkPath",
        description: "(非推奨: $objectWalkPath を使用してください) 生オブジェクトから、ドット記法で指定したパスの値を返します。",
        usage: "rawObjectWalkPath[rawobject, path.to.value]",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: objectWalkPath.evaluator
};

export default model;