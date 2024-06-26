import { ReplaceVariable } from "../../../../../../types/variables";
import { EffectTrigger } from "../../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../../shared/variable-constants";


const triggers = {};
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.EVENT] = ["twitch:timeout"];

const model : ReplaceVariable = {
    definition: {
        handle: "timeoutDuration",
        description: "ユーザーのタイムアウト時間（マイナス値）",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.timeoutDuration || 0;
    }
};

export default model;
