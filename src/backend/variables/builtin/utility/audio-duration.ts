import type { ReplaceVariable } from "../../../../types/variables";
import frontendCommunicator from "../../../common/frontend-communicator";

const model : ReplaceVariable = {
    definition: {
        handle: "audioDuration",
        usage: "audioDuration[filePathOrUrl]",
        description: "音声の再生時間を取得します。",
        examples: [
            {
                usage: `audioDuration["path/to/audio.mp3"]`,
                description: "ローカルの音声ファイルの再生時間（秒）を返します。"
            },
            {
                usage: `audioDuration["https://example.com/audio.mp3"]`,
                description: "URL で指定した音声ファイルの再生時間（秒）を返します。"
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["number", "text"]
    },
    evaluator: async (trigger, url) => {
        if (url == null) {
            return "[URL が指定されていません]";
        }
        try {
            return await frontendCommunicator.fireEventAsync("getSoundDuration", {
                path: url
            });
        } catch {
            return "[再生時間の取得に失敗しました]";
        }
    }
};

export default model;
