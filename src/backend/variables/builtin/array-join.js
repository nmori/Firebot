'use strict';
const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "arrayJoin",
        usage: "arrayJoin[jsonArray, separator]",
        description: "配列の各項目を、指定した区切り文字で連結した文字列を返します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, jsonArray, separator = ",") => {
        if (jsonArray) {
            const array = utils.jsonParse(jsonArray);
            if (Array.isArray(array)) {
                return array.join(separator);
            }
        }
        return jsonArray;
    }
};

module.exports = model;