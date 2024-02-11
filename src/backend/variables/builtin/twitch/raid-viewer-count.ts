import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../shared/effect-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:raid"];
triggers[EffectTrigger.MANUAL] = true;


const model : ReplaceVariable = {
    definition: {
        handle: "raidViewerCount",
        description: "襲撃によってもたらされた視聴者数の取得",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (trigger) => {
        return trigger.metadata.eventData.viewerCount || 0;
    }
};

export default model;
