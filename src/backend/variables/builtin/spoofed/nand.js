"use strict";

// Dummy variable - $NAND logic gets handled by the evaluator

const { OutputDataType, VariableCategory } = require("../../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "NAND",
        usage: "NAND[条件, 条件, ...]",
        description: 'いずれかの条件が不成立の場合にTrueを返す。',
        examples: [
            {
                usage: 'NAND[a === a, b === c]',
                description: "b が c に等しくないとき、True を返す"
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.ALL]
    }
};