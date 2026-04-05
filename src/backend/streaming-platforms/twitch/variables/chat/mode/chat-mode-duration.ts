import type { ReplaceVariable, TriggersObject } from "../../../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["twitch:chat-mode-changed"];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "chatModeDuration",
        description: "フォロワー（分）またはスロー（秒）モードに対応する時間です。",
        triggers: triggers,
        categories: ["trigger based"],
        possibleDataOutput: ["number"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.duration;
    }
};

export default model;
