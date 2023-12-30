import { TriggerType } from "../../../../common/EffectType";
import { ReplaceVariable } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_REPLAY_BUFFER_SAVED_EVENT_ID
} from "../constants";

const triggers = {};
triggers[TriggerType.EVENT] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_REPLAY_BUFFER_SAVED_EVENT_ID}`
];

export const ReplayBufferPathVariable: ReplaceVariable = {
    definition: {
        handle: "obsReplayBufferPath",
        description:
      "OBSが保存した再生バッファファイルのパス",
        possibleDataOutput: ["text"],
        triggers: triggers
    },
    evaluator: async (trigger) => {
        const replayBufferPath = trigger.metadata?.eventData?.savedReplayPath;
        return replayBufferPath ?? "不明";
    }
};
