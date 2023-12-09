"use strict";

// Dummy variable - $OR logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "OR",
        usage: "OR[条件, 条件, ...]",
        description: '条件のいずれかが成立する場合に true を返します。$if[]内でのみ動作します。',
        examples: [
            {
                usage: 'OR[a === b, c === c]',
                description: "c が c と等しい場合に True を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};