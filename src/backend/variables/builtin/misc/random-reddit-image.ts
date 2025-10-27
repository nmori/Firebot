import type { ReplaceVariable } from "../../../../types/variables";

import randomRedditImage from "../../../common/handlers/redditProcessor";

const model : ReplaceVariable = {
    definition: {
        handle: "randomRedditImage",
        usage: "randomRedditImage[subredditName]",
        description: "Redditからランダムに画像を取得する。(悪い画像がないかチェックするよう最善を尽くしますが、内容について注意)。",
        possibleDataOutput: ["text"]
    },
    evaluator: async (_, subreddit) => {
        if (subreddit != null) {
            return await randomRedditImage.getRandomImage(subreddit);
        }

        return "";
    }
};

export default model;