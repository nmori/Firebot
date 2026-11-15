import { ReplaceVariable } from "../../../../../types/variables";
import { getPreviousSceneName } from "../obs-remote";

export const PreviousSceneNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsPreviousSceneName",
        description:
      "直前の OBS シーン名です。OBS 未起動時は 'Unknown' を返します。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: () => {
        return getPreviousSceneName() ?? "Unknown";
    }
};
