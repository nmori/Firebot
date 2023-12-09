"use strict";

// Dummy variable - $ANY logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "ANY",
        usage: "ANY[条件, 条件, ...]",
        description: '条件のいずれかが成立する場合、Trueを返す。$if[] 内でのみ動作します。',
        examples: [
            {
                usage: 'ANY[a === b, c === c]',
                description: "Returns true as c equals c"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};