import type { ReplaceVariable, TriggersObject } from "../../../../../../types/variables";


const triggers: TriggersObject = {};
triggers["manual"] = true;
triggers["event"] = ["twitch:timeout"];

const model : ReplaceVariable = {
    definition: {
        handle: "timeoutDuration",
        description: "ユーザーのタイムアウト時間（分）です。",
        triggers: triggers,
        categories: ["common", "trigger based"],
        possibleDataOutput: ["number"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.timeoutDuration || 0;
    }
};

export default model;
