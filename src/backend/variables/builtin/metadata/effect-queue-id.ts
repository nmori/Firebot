import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:effect-queue-cleared", "firebot:effect-queue-added", "firebot:effect-queue-status"];
triggers["manual"] = true;

const model: ReplaceVariable = {
    definition: {
        handle: "effectQueueId",
        description: "エフェクトキューの ID を返します。",
        triggers: triggers,
        categories: ["trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        const queueId = trigger?.metadata?.eventData?.effectQueueId;
        return queueId ?? "Unknown";
    }
};

export default model;