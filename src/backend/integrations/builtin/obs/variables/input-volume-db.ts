import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_VOLUME_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_VOLUME_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputVolumeDbVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputVolumeDb",
        description: "OBS 入力の音量レベル（dB）を返します。",
        possibleDataOutput: ["number"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputVolumeDb = trigger.metadata?.eventData?.inputVolumeDb;
        return inputVolumeDb ?? 0;
    }
};