// Migration: todo - Needs implementation details

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.EVENT] = ["twitch:timeout"];

const model = {
    definition: {
        handle: "timeoutDuration",
        description: "ユーザーのタイムアウト時間（マイナス値）",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.timeoutDuration || 0;
    }
};

module.exports = model;
