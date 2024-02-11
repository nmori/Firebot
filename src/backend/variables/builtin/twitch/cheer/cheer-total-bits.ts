import { ReplaceVariable, Trigger } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const { EffectTrigger } = require("../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:cheer"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "cheerTotalBits",
        description: "視聴者がチャンネル内でCheerしたビッツ総額。",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger: Trigger) => {
        return trigger.metadata.eventData.totalBits || 0;
    }
};

export default model;
