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
        handle: "arrayFindIndex",
        usage: "arrayFindIndex[jsonArray, matcher, propertyPath]",
        description: "配列からマッチする要素を探し、そのインデックスを返す。",
        examples: [
            {
                usage: 'arrayFindIndex["[\\"a\\",\\"b\\",\\"c\\"]", b]',
                description: '1（"b "のインデックス）を返す。'
            },
            {
                usage: 'arrayFindIndex["[{\\"username\\": \\"alastor\\"},{\\"username\\": \\"ebiggz\\"}]", alastor, username]',
                description: 'username"="alastor"のインデックス0を返す。'
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: (_, jsonArray, matcher, propertyPath = null) => {
        if (jsonArray != null) {
            if (matcher === undefined || matcher === "") {
                return null;
            }

            matcher = utils.jsonParse(matcher);

            if (propertyPath === 'null' || propertyPath === "") {
                propertyPath = null;
            }

            const array = utils.jsonParse(jsonArray);
            if (Array.isArray(array)) {
                let found;

                // propertyPath arg not specified
                if (propertyPath == null || propertyPath === "") {
                    found = array.findIndex(v => v === matcher);

                // property path specified
                } else {
                    found = array.findIndex(v => {
                        const property = getPropertyAtPath(v, propertyPath);
                        return property === matcher;
                    });
                }
                return JSON.stringify(found !== -1 ? found : null);
            }
        }
        return null;
    }
};

module.exports = model;