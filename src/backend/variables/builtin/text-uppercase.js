// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "uppercase",
        description: "与えられたテキスト文字列全体を大文字にする。",
        usage: "uppercase[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? text.toUpperCase() : "";
    }
};

module.exports = model;
