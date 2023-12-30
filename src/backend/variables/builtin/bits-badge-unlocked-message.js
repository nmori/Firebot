"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:bits-badge-unlocked"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "bitsBadgeUnlockedMessage",
        description: "このメッセージには、誰かが新しいビッツバッジのロックを解除したことをシェアしたときのものも含まれている。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.message || "";
    }
};

module.exports = model;
