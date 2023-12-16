"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:banned", "twitch:timeout"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "modReason",
        description: "ユーザーが禁止された、またはタイムアウトした理由。",
        triggers: triggers,
        categories: [VariableCategory.USER, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.text]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.modReason;
    }
};

module.exports = model;
