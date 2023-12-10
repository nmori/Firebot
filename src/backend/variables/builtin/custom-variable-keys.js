"use strict";

const customVariableManager = require("../../common/custom-variable-manager");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function isObject(data) {
    return typeof data === 'object' && !(data instanceof String);
}

const model = {
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
    evaluator: (_, name, propertyPath) => {
        const data = customVariableManager.getCustomVariable(name, propertyPath);
        if (data == null || !isObject(data)) {
            return "[]"; // same as JSON.stringify([]);
        }

        const keys = Object.keys(data);
        return JSON.stringify(keys);
    }
};


module.exports = model;
