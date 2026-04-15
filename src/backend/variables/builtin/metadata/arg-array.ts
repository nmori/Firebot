import type { ReplaceVariable, Trigger, TriggersObject } from "../../../../types/variables";
import type { UserCommand } from "../../../../types/commands";

const triggers: TriggersObject = {};
triggers["command"] = true;
triggers["event"] = [
    "twitch:chat-message"
];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "argArray",
        description: "コマンドの引数を配列として返します。",
        triggers: triggers,
        categories: ["trigger based", "advanced"],
        possibleDataOutput: ["array"]
    },
    evaluator: (trigger: Trigger) : string[] => {
        return trigger.metadata.userCommand?.args
            ?? (trigger.metadata.eventData?.userCommand as UserCommand)?.args
            ?? [];
    }
};

export default model;