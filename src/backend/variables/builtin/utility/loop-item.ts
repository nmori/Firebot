import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "loopItem",
        usage: "loopItem",
        description: "Arrayループモードを使用するLoop Effect演出内の現在のループ反復の項目",
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopItem;
    }
};

export default model;
