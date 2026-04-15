import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["command"] = true;
triggers["event"] = true;
triggers["manual"] = true;
triggers["custom_script"] = true;
triggers["preset"] = true;
triggers["channel_reward"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "user",
        description: "トリガーに関連付けられたユーザー名を返します（存在する場合）。",
        triggers: triggers,
        categories: ["trigger based", "common", "user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger: Trigger) => {
        return trigger.metadata.username;
    }
};

export default model;