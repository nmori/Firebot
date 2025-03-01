import { ReplaceVariable } from "../../../../../types/variables";
import { isRecording } from "../obs-remote";
import { VariableCategory } from "../../../../../shared/variable-constants";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsRecording",
        description:
      "OBSが現在録画中であれば'true'を、録画中でなければ'false'を返す。",
        possibleDataOutput: ["bool"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
    },
    evaluator: async () => {
        const recordState = await isRecording();
        return recordState ?? false;
    }
};
