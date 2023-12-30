// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "max",
        description: "渡された番号のうち、最も大きい番号を返す。",
        usage: "max[num1, num2, ...]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, ...args) => {
        const max = Math.max(...args);

        if (isNaN(max)) {
            return 0;
        }

        return max;
    }
};

module.exports = model;

