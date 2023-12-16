"use strict";

const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "evalVars",
        usage: "evalVars[text]",
        description: "文字列の $variables を評価します。外部ソース (txt ファイルや API) からのテキスト $vars を評価する際に便利です。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, text = "") => {
        return await utils.populateStringWithTriggerData(text, trigger);
    }
};

module.exports = model;
