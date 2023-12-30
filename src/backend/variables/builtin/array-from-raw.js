'use strict';
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawArrayFrom",
        usage: "rawArrayFrom[...values]",
        description: "リストされた値を含む生の配列を返す",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, ...values) => values
};

module.exports = model;