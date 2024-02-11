import { ReplaceVariable } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import api from "../../../twitch-api/api";
import accountAccess from "../../../common/account-access";

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
        categories: [VariableCategory.NUMBERS, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (trigger, username: string) => {
        let count = 0;

        const streamer = accountAccess.getAccounts().streamer;

        if (username == null) {
            username = streamer.username;
        }

        try {
            const user = await api.users.getUserByName(username);

            const response = await api.streamerClient.channels.getChannelFollowerCount(user.id);
            count = response ?? 0;
        } catch {
            // silently fail
        }

        return count;
    }
};

export default model;