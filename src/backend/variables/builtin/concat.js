// Migration: done

'use strict';

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "concat",
        description: "テキストを結合します",
        usage: "concat[text, text, ...]",
        categories: [VariableCategory.TEXT],
        possibleDataOuput: [OutputDataType.TEXT]
    },
    evaluator: (_, ...args) => args.join('')
};

module.exports = model;