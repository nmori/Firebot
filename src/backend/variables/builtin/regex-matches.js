"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "regexMatches",
        description: "正規表現で文字列をフィルタリングし、マッチしたすべてのJSON配列を返す",
        usage: "regexMatches[string, expression]",
        examples: [
            {
                usage: "regexMatches[string, expression, flags]",
                description: "正規表現の評価にフラグを追加する。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, stringToEvaluate, expression, flags) => {
        const regex = RegExp(expression, flags);
        const matches = stringToEvaluate.match(regex);

        return JSON.stringify([...matches]);
    }
};

module.exports = model;