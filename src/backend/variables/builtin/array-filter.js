// Migration: done

'use strict';
const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

function getPropertyAtPath(obj, propertyPath) {
    let data = obj;
    const pathNodes = propertyPath.split(".");
    for (let i = 0; i < pathNodes.length; i++) {
        if (data == null) {
            break;
        }
        let node = pathNodes[i];
        // parse to int for array access
        if (!isNaN(node)) {
            node = parseInt(node);
        }
        data = data[node];
    }
    return data;
}

const model = {
    definition: {
        handle: "arrayFilter",
        usage: "arrayFilter[jsonArray, matcher, propertyPath, removeMatches]",
        examples: [
            {
                usage: 'arrayFilter["[1,2,3]", 1, null, false]',
                description: "1に等しくないものを除外する（結果:[1]）"
            },
            {
                usage: 'arrayFilter["[1,2,3]", 1, null, true]',
                description: '1に等しいものを除外する（結果:[2,3]）'
            },
            {
                usage: 'arrayFilter["[{\\"username\\": \\"ebiggz\\"},{\\"username\\": \\"MageEnclave\\"}]", ebiggz, username, true]',
                description: 'ユーザー名プロパティが "ebiggz "に等しいものを除外する。 (結果: [{\\"username\\": \\"MageEnclave\\"}])'
            }
        ],
        description: "フィルタリングされた新しい配列を返す",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, jsonArray, matcher, propertyPath = null, removeMatches = false) => {
        if (jsonArray != null) {
            if (matcher === undefined || matcher === "") {
                return jsonArray;
            }

            matcher = utils.jsonParse(matcher);

            if (propertyPath === 'null' || propertyPath === "") {
                propertyPath = null;
            }

            // eslint-disable-next-line eqeqeq
            removeMatches = removeMatches === true || removeMatches === 'true';

            const array = utils.jsonParse(jsonArray);
            if (Array.isArray(array)) {
                if (propertyPath == null || propertyPath === "") {
                    const newArray = removeMatches ? array.filter(v => v !== matcher) : array.filter(v => v === matcher);
                    return JSON.stringify(newArray);
                }
                const newArray = array.filter(v => {
                    const property = getPropertyAtPath(v, propertyPath);
                    return removeMatches ? property !== matcher : property === matcher;
                });
                return JSON.stringify(newArray);
            }
        }
        return JSON.stringify([]);
    }
};

module.exports = model;