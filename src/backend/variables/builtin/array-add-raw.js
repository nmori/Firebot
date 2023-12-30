'use strict';

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawArrayAdd",
        usage: "rawArrayAdd[array, newElement]",
        examples: [
            {
                usage: 'rawArrayAdd[some_array, 4]',
                description: "入力raw配列の末尾に4を追加した新しいraw配列を返す。"
            },
            {
                usage: 'rawArrayAdd[some_array, 4, true]',
                description: '入力raw配列の先頭に4を付加した後、新しいraw配列を再実行する。'
            }
        ],
        description: "要素を追加した新しい配列を返します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, rawArray, newElement, addToFront = false) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse(`${rawArray}`);

            //eslint-disable-next-line no-empty
            } catch (ignore) {}
        }
        if (rawArray == null || rawArray === '' || !Array.isArray(rawArray)) {
            return [newElement];
        }

        const clone = rawArray.map(item => item);
        if (addToFront === true) {
            clone.unshift(newElement);
            return clone;
        }

        clone.push(newElement);
        return clone;
    }
};

module.exports = model;