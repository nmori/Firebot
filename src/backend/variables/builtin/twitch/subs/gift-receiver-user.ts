import { ReplaceVariable } from "../../../../../types/variables";
import { EffectTrigger } from "../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:subs-gifted", "twitch:gift-sub-upgraded"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "giftReceiverUsername",
        description: "プレゼントされたサブスクギフトを受け取ったユーザーの名前。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const gifteeUsername = trigger.metadata.eventData.gifteeUsername;

        return gifteeUsername || "UnknownUser";
    }
};

export default model;
