// Deprecated
import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../shared/effect-constants";
import user from "../metadata/user";

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
        handle: "useridname",
        description: "(非推奨: $user か $usernameを使用のこと) 指定されたトリガの、関連する基本的なユーザ識別名。",

        triggers: triggers,
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: user.evaluator
};

export default model;