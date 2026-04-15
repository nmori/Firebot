import type { ReplaceVariable, Trigger } from "../../../../types/variables";

import customVariableKeysRaw from './custom-variable-keys-raw';

const model : ReplaceVariable = {
    definition: {
        handle: "customVariableKeys",
        usage: "customVariableKeys[name]",
        examples: [
            {
                usage: "customVariableKeys[name, 1]",
                description: "第2引数に配列インデックスを指定して、配列要素のオブジェクトのキー配列を取得します。"
            },
            {
                usage: "customVariableKeys[name, property]",
                description: "第2引数にドット記法のプロパティパスを指定して、オブジェクトのプロパティのキー配列を取得します。"
            }
        ],
        description: "カスタム変数に保存されたオブジェクトのキー配列を取得します。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        name: string,
        propertyPath: string
    ) : string => {
        const keys = customVariableKeysRaw.evaluator(trigger, name, propertyPath);
        return JSON.stringify(keys);
    }
};


export default model;