import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_AUDIO_MONITOR_TYPE_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_AUDIO_MONITOR_TYPE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputAudioMonitorTypeVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputMonitorType",
        description: "OBS 入力のオーディオモニター種別を返します。値は `None`（なし）、`Monitor Only`（モニターのみ）、`Monitor and Output`（モニターと出力）です。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const monitorType = trigger.metadata?.eventData?.monitorType;

        switch (monitorType) {
            case "OBS_MONITORING_TYPE_MONITOR_ONLY":
                return "Monitor Only";

            case "OBS_MONITORING_TYPE_MONITOR_AND_OUTPUT":
                return "Monitor and Output";

            case "OBS_MONITORING_TYPE_NONE":
            default:
                return "None";
        }
    }
};