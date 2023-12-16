"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function isObjectOrArray(data) {
    return Array.isArray(data) || (typeof data === 'object' && !(data instanceof String));
}

const model = {
    definition: {
        handle: "effectOutput",
        usage: "effectOutput[name]",
        description: "先行演出で出力されたデータを取得する。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: ({ effectOutputs }, name = "") => {
        const output = (effectOutputs ?? {})[name];
        if (isObjectOrArray(output)) {
            return JSON.stringify(output);
        }
        return output ?? "";
    }
};

module.exports = model;
