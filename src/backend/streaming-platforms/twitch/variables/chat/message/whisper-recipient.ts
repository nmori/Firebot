import type { ReplaceVariable, TriggersObject } from "../../../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["twitch:whisper"];
triggers["manual"] = true;

const model: ReplaceVariable = {
    definition: {
        handle: "whisperRecipient",
        description: "ウィスパーを受信したアカウント種別（streamer または bot）です。",
        triggers: triggers,
        categories: ["trigger based", "common"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.sentTo;
    }
};

export default model;