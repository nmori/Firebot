import type { ReplaceVariable, TriggersObject } from "../../../../../../types/variables";


const triggers: TriggersObject = {};
triggers["event"] = ["twitch:banned", "twitch:unbanned", "twitch:timeout", "twitch:chat-mode-changed", "twitch:shoutout-sent", "twitch:outgoing-raid-canceled", "twitch:outgoing-raid-started"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "moderator",
        description: "操作（BAN/解除/タイムアウト/チャットモード変更/シャウトアウト/レイド開始・取消）を実行したモデレーター名です。",
        triggers: triggers,
        categories: ["user based", "trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.moderator;
    }
};

export default model;
