import { ReplaceVariable } from "../../../../../types/variables";
import { isStreaming } from "../obs-remote";

export const IsStreamingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsStreaming",
        description:
      "OBSが現在配信中であれば'true'を、そうでなければ'false'を返す。",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const streamState = await isStreaming();
        return streamState ?? false;
    }
};
