import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneCollectionName } from "../obs-remote";

export const SceneCollectionNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneCollectionName",
        description:
              "イベントを発火した OBS シーンコレクション名です。イベントがない場合は現在の OBS シーンコレクション名を返します。OBS 未起動時は 'Unknown' を返します。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: async (trigger) => {
        const currentSceneCollectionName = trigger.metadata?.eventData?.sceneCollectionName ?? await getCurrentSceneCollectionName();
        return currentSceneCollectionName ?? "Unknown";
    }
};
