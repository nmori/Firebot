"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "padNumber",
        description: "指定された数値を指定された小数点以下の桁数まで繰り上げる。",
        usage: "padNumber[value, places]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (_, value, places) => {
        // because !value|!places would result in this condition being true for an input of 0
        const numValue = Number(value);
        const numPlaces = Number(places);
        if (
            value == null || value === "" || !Number.isFinite(numValue) ||
            places == null || places === "" || !Number.isFinite(numPlaces)
        ) {
            return value;
        }

        const [integer, fraction] = `${numValue}.0`.split(/\./g);

        return `${integer}.${fraction.padEnd(numPlaces, "0")}`;
    }
};

module.exports = model;