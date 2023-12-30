import { ReplaceVariable } from "../../../../../types/variables";
import { isRecording } from "../obs-remote";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsRecording",
        description:
      "OBS�����ݘ^�撆�ł����'true'���A�^�撆�łȂ����'false'��Ԃ��B",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const recordState = await isRecording();
        return recordState ?? false;
    }
};
