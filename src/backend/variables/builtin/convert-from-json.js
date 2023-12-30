'use strict';
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "convertFromJSON",
        description: "JSONテキストを生のオブジェクト・インスタンスに変換する。",
        usage: "convertFromJSON[json text]",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, jsonText) => {
        if (jsonText == null) {
            return null;
        }
        if (typeof jsonText === 'string' || jsonText instanceof String) {
            try {
                return JSON.parse(`${jsonText}`);

            } catch (err) {
                return "[PARSE ERROR]";
            }
        }
        return jsonText;
    }
};

module.exports = model;