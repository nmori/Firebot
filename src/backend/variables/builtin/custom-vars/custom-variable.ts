import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

import customVariableRaw from './custom-variable-raw';

const model : ReplaceVariable = {
    definition: {
        handle: "customVariable",
        usage: "customVariable[name]",
        examples: [
            {
                usage: "customVariable[name, 1]",
                description: "配列のインデックスを第2引数に与えて、配列の項目を取得する。"
            },
            {
                usage: "customVariable[name, property]",
                description: "第2引数にプロパティパス（ドット記法）を与えてプロパティを取得する。"
            },
            {
                usage: "customVariable[name, null, exampleString]",
                description: "カスタム変数がまだ存在しない場合のデフォルト値を設定する。"
            }
        ],
        description: "カスタム変数に保存されているデータを取得します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger, ...args: unknown[]) => {
        const data = customVariableRaw.evaluator(trigger, ...args);
        if (data == null) {
            return null;
        }
        if (typeof data === 'string' || data instanceof String) {
            return `${data}`;
        }
        return JSON.stringify(data);
    }
};


export default model;