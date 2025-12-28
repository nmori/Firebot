import type { ReplaceVariable } from "../../../../types/variables";
import frontendCommunicator from "../../../common/frontend-communicator";
import logger from "../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "videoDuration",
        usage: "videoDuration[filePathOrUrl]",
        description: "動画の再生時間を取得します。",
        examples: [
            {
                usage: `videoDuration["path/to/video.mp4"]`,
                description: "ローカルの動画ファイルの再生時間（秒）を返します。"
            },
            {
                usage: `videoDuration["https://example.com/video.mp4"]`,
                description: "URL で指定した動画ファイルの再生時間（秒）を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text", "number"]
    },
    evaluator: async (trigger, url: string) => {
        if (url == null) {
            return "[URL が指定されていません]";
        }
        const result: number = await frontendCommunicator.fireEventAsync("getVideoDuration", url);

        if (isNaN(result)) {
            logger.error("動画の再生時間を取得中にエラーが発生しました", result);
            return "[再生時間の取得に失敗しました]";
        }
        return result;
    }
};

export default model;