import type { ReplaceVariable } from "../../../../../types/variables";
import { AccountAccess } from "../../../../common/account-access";
import { TwitchApi } from "../../api";

const model : ReplaceVariable = {
    definition: {
        handle: "streamTitle",
        usage: "streamTitle",
        description: "あなたのチャンネルの現在の配信タイトルを取得します。",
        examples: [
            {
                usage: "streamTitle[$target]",
                description: "コマンド内で、ターゲット・チャンネルの配信タイトルを取得する。"
            },
            {
                usage: "streamTitle[$user]",
                description: "関連するユーザー（コマンドをトリガーした人、ボタンを押した人など）の配信タイトルを取得します。"
            },
            {
                usage: "streamTitle[ebiggz]",
                description: "特定のチャンネルの配信タイトルを取得します。"
            }
        ],
        categories: ["common", "user based"],
        possibleDataOutput: ["text"]
    },
    evaluator: async (trigger, username: string) => {
        if (username == null) {
            username = AccountAccess.getAccounts().streamer.username;
        }

        const channelInfo = await TwitchApi.channels.getChannelInformationByUsername(username);

        return channelInfo != null ? channelInfo.title : "[チャンネルが見つかりません］";
    }
};

export default model;