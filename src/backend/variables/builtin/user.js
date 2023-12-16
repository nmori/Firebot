// Migration: info - Needs implementation details

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;

module.exports = {
    definition: {
        handle: "user",
        description: "指定されたトリガに関連するユーザ(存在する場合)",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.username;
    }
};

