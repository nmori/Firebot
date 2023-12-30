// Migration: done

'use strict';

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const api = require("../../twitch-api/api");
const accountAccess = require("../../common/account-access");

const model = {
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
    evaluator: async (_, username) => {
        let count = 0;

        const streamer = accountAccess.getAccounts().streamer;

        if (username == null) {
            username = streamer.username;
        }

        try {
            const user = await api.users.getUserByName(username);

            const response = await api.streamerClient.channels.getChannelFollowers(
                user.id,
                streamer.userId
            );
            if (response) {
                count = response.total;
            }
        } catch {
            // silently fail
        }

        return count;
    }
};

module.exports = model;