"use strict";

// Dummy variable - $NANY logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "NANY",
        usage: "NANY[条件, 条件, ...]",
        description: 'すべての条件が不成立である場合に True を返す。',
        examples: [
            {
                usage: 'NANY[a === b, b === c]',
                description: "a が be と等しくなく、b が c と等しくない場合に True を返す。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};