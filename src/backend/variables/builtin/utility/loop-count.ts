import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "loopCount",
        usage: "loopCount",
        description: "ループ・エフェクトの内部で、現在のループ反復を0ベースでカウントする。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopCount || 0;
    }
};

export default model;