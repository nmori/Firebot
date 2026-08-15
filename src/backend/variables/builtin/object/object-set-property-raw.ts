import type { ReplaceVariable } from "../../../../types/variables";

import objectSetProperty from './object-set-property';

const model : ReplaceVariable = {
    definition: {
        handle: "rawSetObjectProperty",
        description: "(非推奨: $setObjectProperty を使用してください) 生オブジェクトのプロパティを追加または更新します。入れ子のプロパティはドット記法で指定できます (例: some.property)。値を null にするとプロパティを削除します。",
        usage: "rawSetObjectProperty[object, propertyPath, value]",
        categories: ["advanced"],
        possibleDataOutput: ["text"],
        hidden: true
    },
    evaluator: objectSetProperty.evaluator
};
export default model;