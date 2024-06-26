import { ReplaceVariable } from "../../../../../../types/variables";
import { EffectTrigger } from "../../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:chat-mode-changed"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "chatModeState",
        description: "チャットモードの状態。'enabled' か 'disabled'.",
        triggers: triggers,
        categories: [VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.chatModeState;
    }
};

export default model;