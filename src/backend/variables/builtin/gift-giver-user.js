"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:subs-gifted", "twitch:community-subs-gifted", "twitch:gift-sub-upgraded"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "giftGiverUsername",
        description: "サブスクギフトを贈ったユーザーの名前。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const gifterUsername = trigger.metadata.eventData.gifterUsername;
        return gifterUsername || "UnknownUser";
    }
};

module.exports = model;
