// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "lowercase",
        description: "与えられたテキスト文字列全体を小文字にする。",
        usage: "lowercase[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? text.toLowerCase() : "";
    }
};

module.exports = model;
