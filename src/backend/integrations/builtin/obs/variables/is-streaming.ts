import { ReplaceVariable } from "../../../../../types/variables";
import { isStreaming } from "../obs-remote";

export const IsStreamingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsStreaming",
        description:
      "OBS�����ݔz�M���ł����'true'���A�����łȂ����'false'��Ԃ��B",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        const streamState = await isStreaming();
        return streamState ?? false;
    }
};
