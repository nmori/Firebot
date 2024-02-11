import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "loopItem",
        usage: "loopItem",
        description: "Arrayループモードを使用するLoop Effect効果内の現在のループ反復の項目",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER, OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.loopItem;
    }
};

export default model;
