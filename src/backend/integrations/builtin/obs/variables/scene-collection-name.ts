import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneCollectionName } from "../obs-remote";

export const SceneCollectionNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneCollectionName",
        description:
<<<<<<< HEAD
      "現在の OBS シーンコレクション の名前。OBSが起動していない場合は、'不明'を返します。.",
    possibleDataOutput: ["text"],
  },
  evaluator: async (trigger) => {
=======
      "The name of the OBS scene collection that triggered the event, or the name of the current OBS scene collection if there is no event. If OBS isn't running, it returns 'Unknown'.",
        possibleDataOutput: ["text"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
    },
    evaluator: async (trigger) => {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        const currentSceneCollectionName = trigger.metadata?.eventData?.sceneCollectionName ?? await getCurrentSceneCollectionName();
        return currentSceneCollectionName ?? "不明";
    }
};
