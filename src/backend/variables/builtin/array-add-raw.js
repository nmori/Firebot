'use strict';

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rawArrayAdd",
        usage: "rawArrayAdd[配列, 新規要素]",
        examples: [
            {
                usage: 'rawArrayAdd[some_array, 4]',
                description: "some_arrayの末尾に4つを追加した新しい配列を返します"
            },
            {
                usage: 'rawArrayAdd[some_array, 4, true]',
                description: 'some_array配列の先頭に4つを追加した新しい配列を返します'
            }
        ],
        description: "要素を追加した新しい配列を返します。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, rawArray, newElement, addToFront = false) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse('' + rawArray);

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