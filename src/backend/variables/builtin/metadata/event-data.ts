import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = true;
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "eventData",
        description: "イベントに含まれるすべてのメタデータを格納したオブジェクトを返します。",
        triggers: triggers,
        categories: ["trigger based", "advanced"],
        possibleDataOutput: ["object"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData;
    }
};

export default model;