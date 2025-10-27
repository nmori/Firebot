import type { ReplaceVariable, TriggersObject } from "../../../../../../types/variables";

const triggers: TriggersObject = {};
triggers["manual"] = true;
triggers["command"] = true;
triggers["event"] = [
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
        categories: ["common", "trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger, target: null | string) => {
        let messageParts = [];
        if (trigger.type === "command") {
            messageParts = trigger.metadata.chatMessage.parts;
        } else if (trigger.type === "event") {
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