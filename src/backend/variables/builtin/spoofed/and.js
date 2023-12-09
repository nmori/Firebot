"use strict";

// Dummy variable - $AND logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "AND",
        usage: "AND[条件, 条件, ...]",
        description: 'すべての条件が成立する場合、 true を返します。$if[]内でのみ動作します。',
        examples: [
            {
                usage: 'AND[a === a, b === b]',
                description: "a が a に等しく、b が b に等しいとき、true を返します"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};