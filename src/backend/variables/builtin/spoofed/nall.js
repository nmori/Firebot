"use strict";

// Dummy variable - $NALL logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "NALL",
        usage: "NALL[条件, 条件, ...]",
        description: 'いずれかの条件が不成立である場合に True を返す。',
        examples: [
            {
                usage: 'NALL[a === a, b === c]',
                description: "b が c に等しくないときにTrue を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};