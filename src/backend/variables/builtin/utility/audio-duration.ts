import type { ReplaceVariable } from "../../../../types/variables";
import frontendCommunicator from "../../../common/frontend-communicator";

const model : ReplaceVariable = {
    definition: {
        handle: "audioDuration",
        usage: "audioDuration[filePathOrUrl]",
        description: "オーディオの再生時間を取得しようとします。",
        examples: [
            {
                usage: `audioDuration["path/to/audio.mp3"]`,
                description: "オーディオファイルの再生時間を秒単位で返します。"
            },
            {
                usage: `audioDuration["https://example.com/audio.mp3"]`,
                description: "URL のオーディオファイルの再生時間を秒単位で返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: async (trigger, url) => {
        if (url == null) {
            return "[NO URL PROVIDED]";
        }
        try {
            return await frontendCommunicator.fireEventAsync("getSoundDuration", {
                path: url
            });
        } catch {
            return "[ERROR FETCHING DURATION]";
        }
    }
};

export default model;
