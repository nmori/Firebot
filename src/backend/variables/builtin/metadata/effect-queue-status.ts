import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";
import { EffectQueueConfigManager } from "../../../effects/queues/effect-queue-config-manager";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:effect-queue-cleared", "firebot:effect-queue-added", "firebot:effect-queue-status"];
triggers["manual"] = true;

const model: ReplaceVariable = {
    definition: {
        handle: "effectQueueStatus",
        description: "エフェクトキューの状態（有効/無効）を返します。",
        triggers: triggers,
        categories: ["trigger based"],
        possibleDataOutput: ["bool", "null"]
    },
    evaluator: (trigger) => {
        const queueId = trigger?.metadata?.eventData?.effectQueueId as string;
        const effectQueue = EffectQueueConfigManager.getItem(queueId);

        return effectQueue?.active ?? null;
    }
};

export default model;