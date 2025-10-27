import type { ReplaceVariable } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "loopCount",
        usage: "loopCount",
        description: "ループ・エフェクトの内部で、現在のループ反復を0ベースでカウントする。",
        categories: ["advanced"],
        possibleDataOutput: ["number"]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopCount || 0;
    }
};

export default model;