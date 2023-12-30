// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "round",
        description: "指定された数値を最も近い整数に丸めます。",
        usage: "round[num]",
        examples: [
            {
                usage: "round[num, places]",
                description: "指定された数値を指定された小数点以下の桁数に丸めます。"
            }
        ],
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, number, places) => {
        if (Number.isNaN(number)) {
            return 0;
        }

        if (Number.isNaN(places) || places < 0 || places > 100) {
            return Math.round(Number(number));
        }

        return Number(number).toFixed(places);
    }
};

module.exports = model;