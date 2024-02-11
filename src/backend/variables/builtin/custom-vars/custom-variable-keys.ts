import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import customVariableKeysRaw from './custom-variable-keys-raw';

const model : ReplaceVariable = {
    definition: {
        handle: "customVariableKeys",
        usage: "customVariableKeys[name]",
        examples: [
            {
                usage: "customVariableKeys[name, 1]",
                description: "配列のインデックスを第2引数として与えて、配列アイテムであるオブジェクトのキーの配列を取得する。"
            },
            {
                usage: "customVariableKeys[name, property]",
                description: "第2引数にプロパティ・パス（ドット記法）を与えて、オブジェクト・プロパティのキーの配列を取得する。"
            }
        ],
        description: "カスタム変数に保存されているオブジェクトのキーの配列を取得します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
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