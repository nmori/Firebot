"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:community-subs-gifted"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "rawGiftReceivers",
        description: "受信者のユーザ名とサブセットを行った月を含む生の配列を返します。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.ALL]
    },
    evaluator: (trigger) => {
        if (trigger == null || trigger.metadata == null || trigger.metadata.eventData == null || trigger.metadata.eventData.giftReceivers == null) {
            return "Failed to get gift receiver info";
        }

        return trigger.metadata.eventData.giftReceivers.map(gr => ({
            username: gr.gifteeUsername,
            months: gr.giftSubMonths
        }));
    }
};

module.exports = model;
