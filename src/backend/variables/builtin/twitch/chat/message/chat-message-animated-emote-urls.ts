import { ReplaceVariable } from "../../../../../../types/variables";
import { EffectTrigger } from "../../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = [
    "twitch:chat-message",
    "twitch:first-time-chat",
    "firebot:highlight-message",
    "twitch:viewer-arrived"
];

const model : ReplaceVariable = {
    definition: {
        handle: "chatMessageAnimatedEmoteUrls",
        examples: [
            {
                usage: "chatMessageAnimatedEmoteUrls[1]",
                description: "特定のアニメーション絵文字のURLを取得します。エモートがアニメーションしていない場合、結果は空の文字列を返します。"
            }
        ],
        description: "関連するコマンドまたはイベントから、チャットメッセージのアニメーション化されたエモートのURLを出力します。アニメーションバージョンを持たないエモートは空の文字列を返します。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger, target: null | string) => {
        let messageParts = [];
        if (trigger.type === EffectTrigger.COMMAND) {
            messageParts = trigger.metadata.chatMessage.parts;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageParts = trigger.metadata.eventData.chatMessage.parts;
        }

        const emoteUrls = messageParts.filter(p => p.type === "emote").map(e => e.animatedUrl ?? "");

        if (target != null) {
            return emoteUrls[target];
        }

        return emoteUrls;
    }
};

export default model;