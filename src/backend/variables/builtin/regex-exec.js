// Migration: ?

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "regexExec",
        description: "Filter a string with a regular expression",
        usage: "regexExec[string, expression]",
        examples: [
            {
                usage: "regexExec[string, expression, flags]",
                description: "正規表現の評価にフラグを追加する。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, stringToEvaluate, expression, flags) => {
        const regex = RegExp(expression, flags);

        return regex.exec(stringToEvaluate).filter(m => !!m).toString();
    }
};

module.exports = model;

