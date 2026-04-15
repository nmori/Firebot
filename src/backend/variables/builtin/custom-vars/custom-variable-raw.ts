import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import { CustomVariableManager } from "../../../common/custom-variable-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "rawCustomVariable",
        usage: "rawCustomVariable[name]",
        examples: [
            {
                usage: "rawCustomVariable[name, 1]",
                description: "第2引数に配列インデックスを指定して、配列要素を取得します。"
            },
            {
                usage: "rawCustomVariable[name, property]",
                description: "第2引数にドット記法のプロパティパスを指定して、プロパティを取得します。"
            },
            {
                usage: "rawCustomVariable[name, null, exampleString]",
                description: "カスタム変数がまだ存在しない場合のデフォルト値を設定します。"
            }
        ],
        description: "カスタム変数に保存されたデータを取得します。",
        categories: ["advanced"],
        possibleDataOutput: ["ALL"]
    },
    evaluator: (
        trigger: Trigger,
        name: string,
        propertyPath: string,
        defaultData: unknown
    ) : unknown => {
        const data = CustomVariableManager.getCustomVariable(name, propertyPath, defaultData);
        return data ?? null;
    }
};


export default model;