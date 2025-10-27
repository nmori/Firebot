import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import customVariableManager from "../../../common/custom-variable-manager";

function isObject(data: unknown) {
    return typeof data === 'object' && !(data instanceof String);
}

const model : ReplaceVariable = {
    definition: {
        handle: "rawCustomVariableKeys",
        usage: "rawCustomVariableKeys[name]",
        examples: [
            {
                usage: "rawCustomVariableKeys[name, property|index]",
                description: "第2引数にプロパティ・パス（ドット記法）を与えて、オブジェクト・プロパティのキーの配列を取得する。"
            }
        ],
        description: "カスタム変数に保存されているオブジェクトのキーの配列を取得します。",
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        name: string,
        propertyPath: string
    ) : Array<unknown> => {
        const data = customVariableManager.getCustomVariable(name, propertyPath);
        if (data == null || !isObject(data)) {
            return [];
        }

        return Object.keys(data);
    }
};


export default model;
