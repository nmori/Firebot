// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "commafy",
        description: "数値に適切なカンマを加える.",
        usage: "commafy[number]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, number) => {
        if (isNaN(number)) {
            return "[Error: 数字ではありません]";
        }
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

module.exports = model;
