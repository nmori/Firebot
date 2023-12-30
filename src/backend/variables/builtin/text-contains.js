// Migration: done

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

module.exports = {
    definition: {
        handle: "textContains",
        usage: "textContains[text, search]",
        description: "テキストが検索を含んでいれば真を、そうでなければ偽を返します。",
        categories: [VariableCategory.TEXT],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, text = "", search = "") => {
        return text.toString().includes(search);
    }
};
