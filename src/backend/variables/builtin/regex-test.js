// Migration: ?

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "regexTest",
        description: "文字列が正規表現にマッチするかどうかを調べる",
        usage: "regexTest[string, expression]",
        examples: [
            {
                usage: "regexTest[string, expression, flags]",
                description: "正規表現の評価にフラグを追加する。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, stringToEvaluate, expression, flags) => {
        const regex = RegExp(expression, flags);

        return regex.test(stringToEvaluate);
    }
};

module.exports = model;

