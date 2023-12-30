"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "decodeFromUrl",
        description: "URLエンコードされた文字列から入力テキストをデコードする",
        usage: "decodeFromUrl[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? decodeURIComponent(text) : "";
    }
};

module.exports = model;
