import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const { EffectTrigger } = require("../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "user",
        description: "指定されたトリガに関連するユーザ(存在する場合)",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) => {
        return trigger.metadata.username;
    }
};

export default model;