import { ReplaceVariable } from "../../../../../types/variables";
import { getCurrentSceneCollectionName } from "../obs-remote";

export const SceneCollectionNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneCollectionName",
        description:
      "���݂� OBS �V�[���R���N�V���� �̖��O�BOBS���N�����Ă��Ȃ��ꍇ�́A'�s��'��Ԃ��܂��B.",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => {
    const currentSceneCollectionName = await getCurrentSceneCollectionName();
    return currentSceneCollectionName ?? "�s��";
  },
};
