import { TriggerType } from "../../../../common/EffectType";
import { ReplaceVariable } from "../../../../../types/variables";
import { OBS_EVENT_SOURCE_ID, OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID } from "../constants";
import { getSceneItem } from "../obs-remote";

const triggers = {};
triggers[TriggerType.EVENT] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID}`
];

export const SceneItemNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneItemName",
        description:
      "イベントをトリガーしたOBSシーンアイテムの名前。",
<<<<<<< HEAD
        possibleDataOutput: ["number"],
=======
        possibleDataOutput: ["text"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS],
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        triggers: triggers
    },
    evaluator: async (trigger) => {
        const sceneItem = await getSceneItem(
            trigger.metadata?.eventData?.sceneName as string,
            trigger.metadata?.eventData?.sceneItemId as number
        );
        return sceneItem?.name ?? "不明";
    }
};
