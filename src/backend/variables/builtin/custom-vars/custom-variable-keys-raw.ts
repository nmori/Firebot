import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { CustomVariableManager } from "../../../common/custom-variable-manager";

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
    ) : Array<unknown> => {
        const data = CustomVariableManager.getCustomVariable(name, propertyPath);
        if (data == null || !isObject(data)) {
            return [];
        }

        return Object.keys(data);
    }
};


export default model;
