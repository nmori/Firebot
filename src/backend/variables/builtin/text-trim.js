// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "trim",
        description: "入力テキストの先頭と末尾の空白を削除する。",
        usage: "trim[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? text.trim() : "";
    }
};

module.exports = model;
