import { ReplaceVariable } from "../../../../../types/variables";
import { isRecording } from "../obs-remote";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsRecording",
        description:
      "OBSが現在録画中であれば'true'を、録画中でなければ'false'を返す。",
<<<<<<< HEAD
        possibleDataOutput: ["text"]
=======
        possibleDataOutput: ["bool"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    },
    evaluator: async () => {
        const recordState = await isRecording();
        return recordState ?? false;
    }
};
