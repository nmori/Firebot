"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:sub"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "subCurrentStreak",
        description: "視聴者があなたのチャンネルに連続して登録した月数。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.streak || 1;
    }
};

module.exports = model;
