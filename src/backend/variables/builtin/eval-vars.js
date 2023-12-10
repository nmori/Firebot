"use strict";

const utils = require("../../utility");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "evalVars",
        usage: "evalVars[text]",
        description: "文字列の $variables を評価します。外部ソースからのテキスト $vars を評価する際に便利です (たとえば txt ファイルや API)。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, text = "") => {
        return await utils.populateStringWithTriggerData(text, trigger);
    }
};

module.exports = model;
