// Migration: done

'use strict';
const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "arrayAdd",
        usage: "arrayAdd[jsonArray, newElement]",
        examples: [
            {
                usage: 'arrayAdd["[1,2,3]", 4]',
                description: "配列の末尾に4を加える。(1,2,3,4)"
            },
            {
                usage: 'arrayAdd["[1,2,3]", 4, true]',
                description: '配列の先頭に4を加える。(4,1,2,3)'
            }
        ],
        description: "要素を追加した新しい配列を返します",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, jsonArray, newElement, addToFront = false) => {
        if (jsonArray != null) {
            addToFront = addToFront === true || addToFront === 'true';
            const array = utils.jsonParse(jsonArray);
            if (Array.isArray(array)) {
                //attempt to parse newElement as json
                newElement = utils.jsonParse(newElement);

                if (addToFront) {
                    array.unshift(newElement);
                } else {
                    array.push(newElement);
                }
                return JSON.stringify(array);
            }
        }
        return JSON.stringify([]);
    }
};

module.exports = model;