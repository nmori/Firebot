import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_MUTE_STATE_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_MUTE_STATE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputMutedVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputMuted",
        description: "OBS 入力がミュートなら `true`、そうでなければ `false` を返します。",
        possibleDataOutput: ["bool"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputMuted = trigger.metadata?.eventData?.inputMuted;
        return inputMuted ?? false;
    }
};