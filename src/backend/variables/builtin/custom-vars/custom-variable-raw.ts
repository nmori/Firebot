import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const customVariableManager = require("../../../common/custom-variable-manager");

const model : ReplaceVariable = {
    definition: {
        handle: "rawCustomVariable",
        usage: "rawCustomVariable[name]",
        examples: [
            {
                usage: "rawCustomVariable[name, 1]",
                description: "配列のインデックスを第2引数に与えて、配列の項目を取得する。"
            },
            {
                usage: "rawCustomVariable[name, property]",
                description: "第2引数にプロパティパス（ドット記法）を与えてプロパティを取得する。"
            },
            {
                usage: "rawCustomVariable[name, null, exampleString]",
                description: "カスタム変数がまだ存在しない場合のデフォルト値を設定する。"
            }
        ],
        description: "カスタム変数に保存されているデータを取得します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    },
    evaluator: (
        trigger: Trigger,
        name: string,
        propertyPath: string,
        defaultData: unknown
    ) : unknown => {
        const data = customVariableManager.getCustomVariable(name, propertyPath, defaultData);
        if (data == null) {
            return null;
        }
        return data;
    }
};


export default model;