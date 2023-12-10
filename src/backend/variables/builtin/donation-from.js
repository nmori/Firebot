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
        handle: "donationFrom",
        description: "StreamLabs/Tipeee/StreamElements/ExtraLifeの寄付を送った人の名前",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const from = (trigger.metadata.eventData && trigger.metadata.eventData.from) || "Unknown User";

        return from;
    }
};

module.exports = model;
