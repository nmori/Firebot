import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType } from "../../../../shared/variable-constants";

const randomRedditImage = require("../../../common/handlers/redditProcessor");

const model : ReplaceVariable = {
    definition: {
        handle: "randomRedditImage",
        usage: "randomRedditImage[subredditName]",
        description: "Redditからランダムに画像を取得する。(悪い画像がないかチェックするよう最善を尽くしますが、内容について注意)。",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (_, subreddit) => {
        if (subreddit != null) {
            return randomRedditImage.getRandomImage(subreddit);
        }

        return "";
    }
};

export default model;