import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["firebot:custom-variable-set"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "createdCustomVariableData",
        description: "作成されたカスタム変数のデータ。",
        triggers: triggers,
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) : unknown => {
        return trigger.metadata.eventData.createdCustomVariableData || "";
    }
};

export default model;
