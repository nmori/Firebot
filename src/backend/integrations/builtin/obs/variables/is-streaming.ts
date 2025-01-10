import { ReplaceVariable } from "../../../../../types/variables";
import { isStreaming } from "../obs-remote";
import { VariableCategory } from "../../../../../shared/variable-constants";

export const IsStreamingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsStreaming",
        description:
      "OBSが現在配信中であれば'true'を、そうでなければ'false'を返す。",
        possibleDataOutput: ["bool"],
        categories: [VariableCategory.ADVANCED, VariableCategory.INTEGRATION, VariableCategory.OBS]
    },
    evaluator: async () => {
        const streamState = await isStreaming();
        return streamState ?? false;
    }
};
