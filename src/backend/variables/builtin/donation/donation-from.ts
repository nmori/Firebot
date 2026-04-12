import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = [
    "twitch:charity-donation",
    "streamlabs:donation",
    "streamlabs:eldonation",
    "tipeeestream:donation",
    "streamelements:donation",
    "extralife:donation"
];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "donationFrom",
        description: "寄付を送ったユーザー名",
        triggers: triggers,
        categories: ["common", "trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        const from = (trigger.metadata.eventData && trigger.metadata.eventData.from) || "不明なユーザー";

        return from;
    }
};

export default model;