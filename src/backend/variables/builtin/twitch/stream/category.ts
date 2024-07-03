import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const TwitchApi = require("../../../../twitch-api/api");
const accountAccess = require("../../../../common/account-access");

const model : ReplaceVariable = {
    definition: {
        handle: "category",
        description: "あなたのチャンネルに設定されている現在のカテゴリ/ゲームを取得します。",
        examples: [
            {
                usage: "category[$target]",
                description: "コマンドの場合、ターゲットユーザーに設定されているカテゴリ/ゲームを取得します。"
            },
            {
                usage: "category[$user]",
                description: "関連するユーザー（コマンドをトリガーした人、ボタンを押した人など）に設定されているカテゴリー/ゲームを取得します。"
            },
            {
                usage: "category[ChannelOne]",
                description: "特定のチャンネルに設定されているカテゴリ/ゲームを取得します。"
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username) => {
        if (username === undefined || username == null) {
            if (trigger.metadata?.username === undefined || trigger.metadata?.username == null) {
                username = accountAccess.getAccounts().streamer.username;
            } else {
                username = trigger.metadata?.username;
            }
        }

        const channelInfo = await TwitchApi.channels.getChannelInformationByUsername(username);

        return channelInfo?.gameName || "";
    }
};

export default model;