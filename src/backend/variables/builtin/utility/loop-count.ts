import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "loopCount",
        usage: "loopCount",
        description: "ループエフェクト内の現在のループ回数（0 始まり）を返します。",
        categories: ["advanced"],
        possibleDataOutput: ["number"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopCount || 0;
    }
};

export default model;