import { ReplaceVariable } from "../../../../../types/variables";
import { isRecording } from "../obs-remote";

export const IsRecordingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsRecording",
        description:
      "OBS‚ªŒ»Ý˜^‰æ’†‚Å‚ ‚ê‚Î'true'‚ðA˜^‰æ’†‚Å‚È‚¯‚ê‚Î'false'‚ð•Ô‚·B",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const recordState = await isRecording();
        return recordState ?? false;
    }
};
