import type { ReplaceVariable } from "../../../../types/variables";
import { AccountAccess } from "../../../common/account-access";
import { TwitchApi } from "../api";

const model: ReplaceVariable = {
    definition: {
        handle: "followCount",
        description: "現在のフォロー数",
        examples: [
            {
                usage: "followCount[$target]",
                description: "コマンドの場合、対象ユーザーのフォロー数を取得する。"
            },
            {
                usage: "followCount[$user]",
                description: "関連するユーザーのフォローカウントを取得します。"
            },
            {
                usage: "followCount[ChannelOne]",
                description: "特定のチャンネルのフォローカウントを取得します。"
            }
        ],
        categories: ["numbers", "user based"],
        possibleDataOutput: ["number"]
    },
    evaluator: async (trigger, username: string) => {
        let count = 0;

        const streamer = AccountAccess.getAccounts().streamer;

        if (username == null) {
            username = streamer.username;
        }

        try {
            const user = await TwitchApi.users.getUserByName(username);

            const response = await TwitchApi.streamerClient.channels.getChannelFollowerCount(user.id);
            count = response ?? 0;
        } catch {
            // silently fail
        }

        return count;
    }
};

export default model;