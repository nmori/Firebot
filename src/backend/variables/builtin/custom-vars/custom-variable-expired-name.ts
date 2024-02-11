import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["firebot:custom-variable-expired"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "expiredCustomVariableName",
        description: "時間切れとなったカスタム変数名",
        triggers: triggers,
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) : unknown => {
        const expiredCustomVariableName = trigger.metadata.eventData.expiredCustomVariableName;
        return expiredCustomVariableName;
    }
};

export default model;
