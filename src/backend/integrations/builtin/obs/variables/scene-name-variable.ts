import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneName } from "../obs-remote";

export const SceneNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneName",
        description:
      "���݂� OBS �V�[�����BOBS���N�����Ă��Ȃ��ꍇ��'�s��'��Ԃ��B",
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger) => {
        const currentSceneName = trigger.metadata?.eventData?.sceneName ?? await getCurrentSceneName();
        return currentSceneName ?? "Unknown";
    }
};
