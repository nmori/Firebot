import type { ReplaceVariable, TriggersObject } from "../../../../../types";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_REPLAY_BUFFER_SAVED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_REPLAY_BUFFER_SAVED_EVENT_ID}`
];

export const ReplayBufferPathVariable: ReplaceVariable = {
    definition: {
        handle: "obsReplayBufferPath",
        description:
            "OBS が保存したリプレイバッファファイルのパスです。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"],
        triggers: triggers
    },
    evaluator: (trigger) => {
        const replayBufferPath = trigger.metadata?.eventData?.savedReplayPath;
        return replayBufferPath ?? "Unknown";
    }
};