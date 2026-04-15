import type { ReplaceVariable } from "../../../../types/variables";
import { getRandomImage } from "../../../common/handlers/reddit-processor";

const model : ReplaceVariable = {
    definition: {
        handle: "randomRedditImage",
        usage: "randomRedditImage[subredditName]",
        description: "指定したサブレディットからランダムな画像を取得します。（不適切な画像が含まれる可能性があります）",
        possibleDataOutput: ["text"]
    },
    evaluator: async (_, subreddit: string) => {
        if (subreddit != null) {
            return await getRandomImage(subreddit);
        }

        return "";
    }
};

export default model;