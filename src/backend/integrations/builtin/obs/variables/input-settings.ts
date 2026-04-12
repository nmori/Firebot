import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_CREATED_EVENT_ID,
    OBS_INPUT_SETTINGS_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_CREATED_EVENT_ID}`,
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_SETTINGS_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputSettingsVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputSettings",
        description: "OBS 入力の生の設定オブジェクトを返します。",
        possibleDataOutput: ["object"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputSettings = trigger.metadata?.eventData?.inputSettings;
        return inputSettings ?? {};
    }
};