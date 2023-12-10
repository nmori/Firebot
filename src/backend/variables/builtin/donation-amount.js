// Migration: done

"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = [
    "streamlabs:donation",
    "streamlabs:eldonation",
    "tipeeestream:donation",
    "streamelements:donation",
    "extralife:donation"
];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "donationAmount",
        description: "StreamLabs/Tipeee/StreamElements/ExtraLifeからの寄付金額",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        const donationAmount = (trigger.metadata.eventData && trigger.metadata.eventData.donationAmount) || 0;

        return donationAmount;
    }
};

module.exports = model;
