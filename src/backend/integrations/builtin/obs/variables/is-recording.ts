import { ReplaceVariable } from "../../../../../types/variables";
import { isRecording } from "../obs-remote";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsRecording",
        description:
      "OBSが現在録画中であれば'true'を、録画中でなければ'false'を返す。",
        possibleDataOutput: ["bool"]
    },
    evaluator: async () => {
        const recordState = await isRecording();
        return recordState ?? false;
    }
};
