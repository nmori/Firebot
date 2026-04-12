import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import { OBS_EVENT_SOURCE_ID, OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID } from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const GroupNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsGroupName",
        description:
            "イベントを発火したアイテムを含む OBS グループ名です。グループ外の場合は 'Unknown' です。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"],
        triggers: triggers
    },
    evaluator: (trigger) => {
        const groupName = trigger.metadata?.eventData?.groupName;
        return groupName ?? "Unknown";
    }
};