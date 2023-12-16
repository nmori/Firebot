// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const util = require("../../utility");

const model = {
    definition: {
        handle: "capitalize",
        description: "指定されたテキストを大文字にする。",
        usage: "capitalize[text]",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text) => {
        return text ? util.capitalize(text) : "";
    }
};

module.exports = model;
