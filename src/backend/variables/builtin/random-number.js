// Migration: done

"use strict";

const util = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");


const model = {
    definition: {
        handle: "randomNumber",
        usage: "randomNumber[min, max]",
        description: "指定した範囲の乱数を取得する。",
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, min, max) => {
        return util.getRandomInt(min, max);
    }
};

module.exports = model;
