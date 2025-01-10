import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";

const frontendCommunicator = require("../../../common/frontend-communicator");
const logger = require("../../../../backend/logwrapper");

const model : ReplaceVariable = {
    definition: {
        handle: "videoDuration",
        usage: "videoDuration[filePathOrUrl]",
        description: "ビデオの再生時間を取得しようとします。",
        examples: [
            {
                usage: `videoDuration["path/to/video.mp4"]`,
                description: "Returns the duration of the video file in seconds."
            },
            {
                usage: `videoDuration["https://example.com/video.mp4"]`,
                description: "Returns the duration of the video file from a URL in seconds."
            }
        ],
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT, OutputDataType.NUMBER]
    },
    evaluator: async (trigger, url) => {
        if (url == null) {
            return "[NO URL PROVIDED]";
        }
        const result = await frontendCommunicator.fireEventAsync("getVideoDuration", url);

        if (isNaN(result)) {
            logger.error("Error while retrieving video duration", result);
            return "[ERROR FETCHING DURATION]";
        }
        return result;
    }
};

export default model;