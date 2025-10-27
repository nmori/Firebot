import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

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
        handle: "userBadgeUrls",
        examples: [
            {
                usage: "userBadgeUrls[1]",
                description: "チャットユーザが選択したバッジ画像の URL を取得します。"
            }
        ],
        description: "チャットユーザが選択したバッジ画像の URL を、関連するコマンドまたはイベントから出力します。",
        triggers: triggers,
        categories: ["common", "trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger, target: null | string = null) => {
        let messageParts = [];
        if (trigger.type === "command") {
            messageParts = trigger.metadata.chatMessage.badges;
        } else if (trigger.type === "event") {
            messageParts = trigger.metadata.eventData.chatMessage.badges;
        }
        const badgeUrls = messageParts.map(e => e.url);

        if (target != null) {
            return badgeUrls[target];
        }

        return badgeUrls;
    }
};

export default model;