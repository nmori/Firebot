import type { ReplaceVariable } from "../../../../../types/variables";

const model: ReplaceVariable = {
    definition: {
        handle: "isGiftResub",
        description: "再サブがギフトによるものかどうかです。",
        categories: ["trigger based", "user based"],
        possibleDataOutput: ["bool"],
        triggers: {
            event: [
                "twitch:sub"
            ],
            manual: true
        }
    },
    evaluator: (trigger) => {
        return trigger.metadata?.eventData?.isGiftResub === true;
    }
};

export default model;
