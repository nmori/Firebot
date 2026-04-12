import { ReplaceVariable } from "../../../../../types/variables";
import { isStreaming } from "../obs-remote";

export const IsStreamingVariable: ReplaceVariable = {
    definition: {
        handle: "obsIsStreaming",
        description:
            "OBS が現在配信中なら 'true'、そうでなければ 'false' を返します。",
        possibleDataOutput: ["bool"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: async () => {
        const streamState = await isStreaming();
        return streamState ?? false;
    }
};
