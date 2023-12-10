"use strict";

// Dummy variable - $if logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "if",
        usage: "if[条件, 成立時, 不成立時]",
        description: '条件の評価結果で結果を切りかえます。',
        examples: [
            {
                usage: 'if[$user === Jim, JIM]',
                description: "ユーザーがJimであればJIMを返し、そうでなければ空文字列を返す。"
            },
            {
                usage: 'if[$user === Jim, JIM, JOHN]',
                description: "ユーザーがJimの場合はJIMを返し、そうでない場合はJOHNを返す。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    }
};