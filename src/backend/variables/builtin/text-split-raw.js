// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawSplitText",
        description: "指定した区切り文字でテキストを分割し、生の配列を返します。カスタム変数に便利です。",
        usage: "rawSplitText[text, separator]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text, separator = ",") => {
        return text ? text.split(separator) : [];
    }
};

module.exports = model;
