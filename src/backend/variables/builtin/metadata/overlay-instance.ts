import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = ["firebot:overlay-connected"];
triggers["manual"] = true;

const model: ReplaceVariable = {
    definition: {
        handle: "overlayInstance",
        description: "イベントをトリガーしたオーバーレイインスタンスの名前を返します。",
        triggers: triggers,
        categories: ["trigger based"],
        possibleDataOutput: ["text"]
    },
    evaluator: (trigger) => {
        return trigger.metadata?.eventData?.instanceName ?? "Default";
    }
};

export default model;