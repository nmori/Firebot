"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:community-subs-gifted"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "giftCount",
        description: "サブスクギフトの回数",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.subCount || 0;
    }
};

module.exports = model;
