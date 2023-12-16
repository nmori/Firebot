"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:sub"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "subMessage",
        description: "再サブスクに含まれるメッセージ。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.subMessage || "";
    }
};

module.exports = model;
