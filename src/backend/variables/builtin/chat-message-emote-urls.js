// Migration: info needed
"use strict";

const { EffectTrigger } = require("../../../shared/effect-constants");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const triggers = {};
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = ["twitch:chat-message", "firebot:highlight-message"];

const model = {
    definition: {
        handle: "chatMessageEmoteUrls",
        examples: [
            {
                usage: "chatMessageEmoteUrls[1]",
                description: "特定のエモートのURLを取得する。"
            }
        ],
        description: "関連するコマンドまたはイベントからチャットメッセージのエモートのURLを出力します。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger, target = null) => {
        let messageParts = [];
        if (trigger.type === EffectTrigger.COMMAND) {
            messageParts = trigger.metadata.chatMessage.parts;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageParts = trigger.metadata.eventData.chatMessage.parts;
        }

        const emoteUrls = messageParts.filter(p => p.type === "emote" || p.type === "third-party-emote").map(e => e.url);

        if (target != null) {
            return emoteUrls[target];
        }

        return emoteUrls;
    }
};

module.exports = model;
