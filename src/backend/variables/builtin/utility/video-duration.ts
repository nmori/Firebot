import type { ReplaceVariable } from "../../../../types/variables";
import frontendCommunicator from "../../../common/frontend-communicator";
import logger from "../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "videoDuration",
        usage: "videoDuration[filePathOrUrl]",
        description: "動画の再生時間を取得しようとします。",
        examples: [
            {
                usage: `videoDuration["path/to/video.mp4"]`,
                description: "動画ファイルの再生時間を秒単位で返します。"
            },
            {
                usage: `videoDuration["https://example.com/video.mp4"]`,
                description: "URL の動画ファイルの再生時間を秒単位で返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"]
    },
    evaluator: async (trigger, url: string) => {
        if (url == null) {
            return "[NO URL PROVIDED]";
        }
        const result: number = await frontendCommunicator.fireEventAsync("getVideoDuration", url);

        if (isNaN(result)) {
            logger.error("Error while retrieving video duration", result);
            return "[ERROR FETCHING DURATION]";
        }
        return result;
    }
};

export default model;