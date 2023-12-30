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
        handle: "rawArrayFindIndex",
        usage: "rawArrayFindIndex[rawarray, matcher, propertyPath]",
        description: "配列からマッチする要素を探し、そのインデックスを返す。",
        examples: [
            {
                usage: 'rawArrayFindIndex[someRawArray, b]',
                description: 'b "のインデックスである1を返す。'
            },
            {
                usage: 'rawArrayFindIndex[someRawArray, value, key]',
                description: '"value "の値を持つキーを持つ項目を配列から探す'
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: (_, rawArray, matcher, propertyPath = null) => {
        if (typeof rawArray === 'string' || rawArray instanceof String) {
            try {
                rawArray = JSON.parse(`${rawArray}`);

            //eslint-disable-next-line no-empty
            } catch (ignore) {}
        }

        if (!Array.isArray(rawArray) || matcher === undefined) {
            return null;
        }

        if (typeof matcher === 'string' || matcher instanceof String) {
            matcher = utils.jsonParse(`${matcher}`);
        }

        if (propertyPath === 'null' || propertyPath === "") {
            propertyPath = null;
        }

        let found;

        // propertyPath arg not specified
        if (propertyPath == null || propertyPath === "") {
            found = rawArray.findIndex(v => v === matcher);

        // property path specified
        } else {
            found = rawArray.findIndex(v => {
                const property = getPropertyAtPath(v, propertyPath);
                return property === matcher;
            });
        }
        return found !== -1 ? found : null;
    }
};

module.exports = model;