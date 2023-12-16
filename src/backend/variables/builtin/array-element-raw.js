'use strict';
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawArrayElement",
        usage: "rawArrayElement[rawArray, index]",
        description: "入力 raw 配列の、指定したインデックスの要素を返します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: (_, rawArray, index) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse('' + rawArray);

            //eslint-disable-next-line no-empty
            } catch (ignore) {}
        }

        if (Array.isArray(rawArray)) {
            return rawArray[index] || null;
        }
        return null;
    }
};

module.exports = model;