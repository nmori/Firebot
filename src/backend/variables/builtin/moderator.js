"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:banned", "twitch:unbanned", "twitch:timeout", "twitch:chat-mode-changed"];
triggers[EffectTrigger.MANUAL] = true;

const model = {
    definition: {
        handle: "moderator",
        description: "アクション（禁止、禁止解除、タイムアウト、チャットモードの変更）を実行したモデレーターの名前。",
        triggers: triggers,
        categories: [VariableCategory.USER, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.text]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.moderator;
    }
};

module.exports = model;
