// Migration: info needed

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "rawArgArray",
        description: "コマンド引数の生の配列を返す",
        triggers: triggers,
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.userCommand ? trigger.metadata.userCommand.args : [];
    }
};

module.exports = model;
