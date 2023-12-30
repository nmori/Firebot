import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneCollectionName } from "../obs-remote";

export const SceneCollectionNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneCollectionName",
        description:
      "現在の OBS シーンコレクション の名前。OBSが起動していない場合は、'不明'を返します。.",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => {
    const currentSceneCollectionName = await getCurrentSceneCollectionName();
    return currentSceneCollectionName ?? "不明";
  },
};
