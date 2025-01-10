import { ReplaceVariable } from "../../../../../types/variables";
import { isRecording } from "../obs-remote";
import { VariableCategory } from "../../../../../shared/variable-constants";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsRecording",
        description:
      "OBS‚ªŒ»Ý˜^‰æ’†‚Å‚ ‚ê‚Î'true'‚ðA˜^‰æ’†‚Å‚È‚¯‚ê‚Î'false'‚ð•Ô‚·B",
        possibleDataOutput: ["bool"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
    },
    evaluator: async () => {
        const recordState = await isRecording();
        return recordState ?? false;
    }
};
