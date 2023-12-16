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
        handle: "rawArrayFind",
        usage: "rawArrayFind[someRawArray, matcher, propertyPath]",
        description: "生の配列から、最初にマッチした要素を返します。",
        examples: [
            {
                usage: 'rawArrayFind[someRawArray, value]',
                description: '配列の各項目から "value "を検索し、最初にマッチした項目を返す。'
            },
            {
                usage: 'rawArrayFind[someRawArray, value, key]',
                description: '配列の各項目から、"key" プロパティが "value" に等しい項目を検索する。'
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: (_, rawArray, matcher, propertyPath = null) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse('' + rawArray);

            //eslint-disable-next-line no-empty
            } catch (ignore) {}
        }
        if (!Array.isArray(rawArray) || matcher === undefined || matcher === "") {
            return null;
        }

        if (typeof matcher === 'string' || matcher instanceof String) {
            matcher = utils.jsonParse('' + matcher);
        }

        let found;

        // propertyPath arg not specified
        if (propertyPath == null || propertyPath === "") {
            found = rawArray.find(v => v === matcher);

        // property path specified
        } else {
            found = rawArray.find(v => {
                const property = getPropertyAtPath(v, propertyPath);
                return property === matcher;
            });
        }
        return found != null ? found : null;
    }
};

module.exports = model;