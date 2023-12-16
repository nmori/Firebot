// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "splitText",
        description: "指定した区切り文字でテキストを分割し、JSON 配列を返します。カスタム変数に便利です。",
        usage: "splitText[text, separator]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text, separator = ",") => {
        return text ? JSON.stringify(text.split(separator)) : "null";
    }
};

module.exports = model;
