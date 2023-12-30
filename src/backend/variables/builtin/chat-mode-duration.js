"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:chat-mode-changed"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "chatModeDuration",
        description: "フォロワー（分）またはスロー（秒）モードに関連する持続時間。",
        triggers: triggers,
        categories: [VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.number]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.duration;
    }
};

module.exports = model;
