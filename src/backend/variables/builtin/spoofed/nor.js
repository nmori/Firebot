"use strict";

// Dummy variable - $NOR logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "NOR",
        usage: "NOR[条件, 条件, ...]",
        description: 'すべての条件が不成立であった場合に True を返す。',
        examples: [
            {
                usage: 'NOR[a === b, b === c]',
                description: "a が be と等しくなく、b が c と等しくない場合に True を返す。"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};