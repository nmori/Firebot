import { ReplaceVariable } from "../../../../../types/variables";
import { isStreaming } from "../obs-remote";

export const IsStreamingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsStreaming",
        description:
      "OBSが現在配信中であれば'true'を、そうでなければ'false'を返す。",
<<<<<<< HEAD
        possibleDataOutput: ["text"]
=======
        possibleDataOutput: ["bool"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    },
    evaluator: async () => {
        const streamState = await isStreaming();
        return streamState ?? false;
    }
};
