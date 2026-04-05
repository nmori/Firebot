import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_AUDIO_BALANCE_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_AUDIO_BALANCE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputAudioSyncOffsetVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputAudioSyncOffset",
        description: "OBS 入力の音声同期オフセット（ミリ秒）を返します。",
        possibleDataOutput: ["number"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputAudioSyncOffset = trigger.metadata?.eventData?.inputAudioSyncOffset;
        return inputAudioSyncOffset ?? 0;
    }
};