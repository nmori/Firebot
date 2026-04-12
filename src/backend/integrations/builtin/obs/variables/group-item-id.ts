import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import { OBS_EVENT_SOURCE_ID, OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID } from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const GroupItemIdVariable: ReplaceVariable = {
    definition: {
        handle: "obsGroupItemId",
        description:
            "イベントを発火した OBS アイテムのグループ内一意の数値IDです。グループ外の場合は -1 です。",
        possibleDataOutput: ["number"],
        categories: ["advanced", "integrations", "obs"],
        triggers: triggers
    },
    evaluator: (trigger) => {
        const groupItemId = trigger.metadata?.eventData?.groupItemId;
        return groupItemId ?? -1;
    }
};