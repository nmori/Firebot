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
        handle: "rawArrayFilter",
        usage: "rawArrayFilter[rawArray, matcher, propertyPath, removeMatches]",
        examples: [
            {
                usage: 'rawArrayFilter[someRawArray, 1, null, false]',
                description: "1に等しくないものを除外する"
            },
            {
                usage: 'rawArrayFilter[someRawArray, 1, null, true]',
                description: '1に等しいものを除外する'
            },
            {
                usage: 'rawArrayFilter[someRawArray, value, key, true]',
                description: '配列の中で、"value "に等しいキー・プロパティを持つ項目を除外する'
            }
        ],
        description: "フィルタリング済みの新しい配列を返す",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, rawArray, matcher, propertyPath = null, removeMatches = false) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse('' + rawArray);

            //eslint-disable-next-line no-empty
            } catch (ignore) {}
        }

        if (!Array.isArray(rawArray)) {
            return [];
        }

        if (matcher === undefined || matcher === "") {
            return rawArray;
        }

        matcher = utils.jsonParse(matcher);

        if (propertyPath === 'null' || propertyPath === "") {
            propertyPath = null;
        }

        // eslint-disable-next-line eqeqeq
        removeMatches = removeMatches === true || removeMatches === 'true';

        if (propertyPath == null || propertyPath === "") {
            return rawArray.filter(removeMatches ? (v => v !== matcher) : (v => v === matcher));
        }
        return rawArray.filter(v => {
            const property = getPropertyAtPath(v, propertyPath);
            return removeMatches ? property !== matcher : property === matcher;
        });
    }
};

module.exports = model;