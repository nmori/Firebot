import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneName } from "../obs-remote";

export const SceneNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneName",
        description:
            "イベントを発火した OBS シーン名です。イベントがない場合は現在の OBS シーン名を返します。OBS 未起動時は 'Unknown' を返します。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const currentSceneName = trigger.metadata?.eventData?.sceneName ?? getCurrentSceneName();
        return currentSceneName ?? "Unknown";
    }
};
