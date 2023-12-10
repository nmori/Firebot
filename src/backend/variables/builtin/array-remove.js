// Migration: done

'use strict';
const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "arrayRemove",
        usage: "arrayRemove[jsonArray, index]",
        description: "指定したインデックスの要素を取り除いた新しい配列を返します。",
        examples: [
            {
                usage: 'arrayRemove["[1,2,3]", 0]',
                description: "インデックス0の要素を削除する (2,3)"
            },
            {
                usage: 'arrayRemove["[1,2,3]", last]',
                description: '最後のインデックス(1,2)の要素を削除する。'
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, jsonArray, index = 0) => {
        if (jsonArray != null) {
            const array = utils.jsonParse(jsonArray);
            if (Array.isArray(array)) {
                if (isNaN(index) && index === "last") {
                    index = array.length - 1;
                } else if (isNaN(index)) {
                    index = -1;
                }
                if (index < array.length && index > -1) {
                    array.splice(index, 1);
                    return JSON.stringify(array);
                }
            }
            return jsonArray;
        }
        return JSON.stringify([]);
    }
};

module.exports = model;