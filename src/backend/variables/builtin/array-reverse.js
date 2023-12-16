'use strict';
const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "arrayReverse",
        usage: "arrayReverse[jsonArray]",
        description: "新しい逆配列を返す",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, jsonArray) => {
        if (jsonArray) {
            const array = utils.jsonParse(jsonArray);
            if (Array.isArray(array)) {
                return JSON.stringify(array.reverse());
            }
        }
        return JSON.stringify([]);
    }
};

module.exports = model;