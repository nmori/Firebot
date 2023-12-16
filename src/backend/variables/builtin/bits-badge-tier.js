"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:bits-badge-unlocked"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "bitsBadgeTier",
        description: "アンロックされたビッツバッジのティア（100、1000、5000など）。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        const badgeTier = trigger.metadata.eventData.badgeTier || 0;
        return badgeTier;
    }
};

module.exports = model;
