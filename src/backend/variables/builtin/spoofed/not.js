"use strict";

// Dummy variable - $NOT logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "NOT",
        usage: "NOT[条件]",
        description: '条件と逆の結果を返す。$if[]内でのみ動作する。',
        examples: [
            {
                usage: 'NOT[1 === 1]',
                description: "条件が成立しているので False を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};