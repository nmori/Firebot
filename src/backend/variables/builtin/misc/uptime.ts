import type { ReplaceVariable } from "../../../../types/variables";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

const model : ReplaceVariable = {
    definition: {
        handle: "uptime",
        description: "現在の配信の稼働時間を返します。",
        possibleDataOutput: ["text"]
    },
    evaluator: async () => {
        return await TwitchApi.streams.getStreamUptime();
    }
};

export default model;