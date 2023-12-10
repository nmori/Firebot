"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:cheer"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "cheerTotalBits",
        description: "視聴者がチャンネル内でCheerしたビッツの総額",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        const totalBits = trigger.metadata.eventData.totalBits || 0;
        return totalBits;
    }
};

module.exports = model;
