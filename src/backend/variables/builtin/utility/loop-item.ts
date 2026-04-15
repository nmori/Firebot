import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "loopItem",
        usage: "loopItem",
        description: "配列ループモードのループエフェクト内で現在のループ反復のアイテムを返します。",
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopItem;
    }
};

export default model;
