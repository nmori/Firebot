import { ReplaceVariable } from "../../../../../types/variables";
import { EffectTrigger } from "../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:subs-gifted", "twitch:community-subs-gifted", "twitch:gift-sub-upgraded"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "giftGiverUsername",
        description: "サブスクギフトを贈ったユーザーの名前。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const gifterUsername = trigger.metadata.eventData.gifterUsername;
        return gifterUsername || "UnknownUser";
    }
};

export default model;
