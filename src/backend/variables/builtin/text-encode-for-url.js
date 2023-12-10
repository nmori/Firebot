// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "encodeForUrl",
        description: "URLで使用するために入力テキストをエンコードする",
        usage: "encodeForUrl[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? encodeURIComponent(text) : "";
    }
};

module.exports = model;
