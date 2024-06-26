import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../shared/effect-constants";

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = true;
triggers[EffectTrigger.MANUAL] = true;
triggers[EffectTrigger.CUSTOM_SCRIPT] = true;
triggers[EffectTrigger.PRESET_LIST] = true;
triggers[EffectTrigger.CHANNEL_REWARD] = true;
triggers[EffectTrigger.QUICK_ACTION] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "displayName",
        description: "(非推奨:$userDisplayNameを使用）指定されたトリガの関連ユーザ(存在する場合)。表示名。",
        triggers: triggers,
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.displayName ?? trigger.metadata.username;
    }
};

export default model;