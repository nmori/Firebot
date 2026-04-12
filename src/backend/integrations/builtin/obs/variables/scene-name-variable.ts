import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneName } from "../obs-remote";

export const SceneNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneName",
        description:
      "現在の OBS シーン名。OBSが起動していない場合は'不明'を返す。",
<<<<<<< HEAD
        possibleDataOutput: ["text"]
=======
        possibleDataOutput: ["text"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    },
    evaluator: async (trigger) => {
        const currentSceneName = trigger.metadata?.eventData?.sceneName ?? await getCurrentSceneName();
        return currentSceneName ?? "Unknown";
    }
};
