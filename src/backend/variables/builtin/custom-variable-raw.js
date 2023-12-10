"use strict";
const customVariableManager = require("../../common/custom-variable-manager");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
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
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: (_, name, propertyPath, defaultData) => {
        const data = customVariableManager.getCustomVariable(name, propertyPath, defaultData);
        if (data == null) {
            return null;
        }
        return data;
    }
};


module.exports = model;
