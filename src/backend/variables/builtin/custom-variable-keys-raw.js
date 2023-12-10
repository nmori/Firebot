"use strict";

const customVariableManager = require("../../common/custom-variable-manager");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function isObject(data) {
    return typeof data === 'object' && !(data instanceof String);
}

const model = {
    definition: {
        handle: "rawCustomVariableKeys",
        usage: "rawCustomVariableKeys[name]",
        examples: [
            {
                usage: "rawCustomVariableKeys[name, property|index]",
                description: "第2引数としてプロパティ・パス（ドット記法を使用）を与えて、オブジェクト・プロパティのキーの配列を取得する。."
            }
        ],
        description: "カスタム変数に保存されているオブジェクトのキーの配列を取得します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, name, propertyPath) => {
        const data = customVariableManager.getCustomVariable(name, propertyPath);
        if (data == null || !isObject(data)) {
            return '[]';
        }

        return Object.keys(data);
    }
};


module.exports = model;
