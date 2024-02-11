import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["firebot:custom-variable-expired"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "expiredCustomVariableData",
        description: "期限切れカスタム変数のデータ。",
        triggers: triggers,
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) : unknown => {
        const expiredCustomVariableData = trigger.metadata.eventData.expiredCustomVariableData;

        return expiredCustomVariableData;
    }
};

export default model;
