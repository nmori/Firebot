// Migration: done

"use strict";

const randomRedditImage = require("../../common/handlers/redditProcessor");
const { OutputDataType } = require("../../../shared/variable-constants");

const model = {
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

module.exports = model;
