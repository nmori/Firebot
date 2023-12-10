"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawRegexMatches",
        description: "正規表現で文字列をフィルタリングし、マッチしたすべての生の配列を返す",
        usage: "rawRegexMatches[string, expression]",
        examples: [
            {
                usage: "rawRegexMatches[string, expression, flags]",
                description: "正規表現の評価にフラグを追加する。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, stringToEvaluate, expression, flags) => {
        if (typeof flags === 'string' || flags instanceof String) {
            flags = '' + flags;
            if (!flags.includes('g')) {
                flags += 'g';
            }
        } else {
            flags = 'g';
        }

        const regex = RegExp(expression, flags);
        let matches = stringToEvaluate.match(regex);
        if (!matches) {
            return [];
        }
        matches = [...(matches)];
        matches.shift();
        return matches;
    }
};

module.exports = model;