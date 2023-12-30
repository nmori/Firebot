'use strict';
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawArrayRemove",
        usage: "rawArrayRemove[someRawArray, index]",
        description: "指定したインデックスの要素を取り除いた新しい配列を返します。",
        examples: [
            {
                usage: 'rawArrayRemove[someRawArray, 0]',
                description: "インデックス0の要素を削除する"
            },
            {
                usage: 'rawArrayRemove[someRawArray, last]',
                description: '最後のインデックスの要素を削除する'
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, rawArray, index = 0) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse(`${rawArray}`);

            //eslint-disable-next-line no-empty
            } catch (ignore) {}
        }

        if (!Array.isArray(rawArray)) {
            return [];
        }

        if (isNaN(index) && index === "last") {
            index = rawArray.length - 1;

        } else if (isNaN(index)) {
            index = -1;
        }

        const clone = rawArray.map(v => v);
        if (index < rawArray.length && index > -1) {
            clone.splice(index, 1);
        }
        return clone;
    }
};

module.exports = model;