// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const he = require('he');

const model = {
    definition: {
        handle: "encodeForHtml",
        description: "HTMLテンプレート内で安全に使用できるように入力テキストをエンコードする",
        usage: "encodeForHtml[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? he.encode(text) : "";
    }
};

module.exports = model;
