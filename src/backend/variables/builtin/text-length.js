// Migration: done

'use strict';

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "textLength",
        usage: "textLength[text]",
        description: "入力テキストの長さを返す",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, text) => {
        return text ? text.length : 0;
    }
};

module.exports = model;