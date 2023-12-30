import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneName } from "../obs-remote";

export const SceneNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneName",
        description:
      "現在の OBS シーン名。OBSが起動していない場合は'不明'を返す。",
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger) => {
        const currentSceneName = trigger.metadata?.eventData?.sceneName ?? await getCurrentSceneName();
        return currentSceneName ?? "Unknown";
    }
};
