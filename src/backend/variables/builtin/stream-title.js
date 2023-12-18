// Migration: done

"use strict";

const TwitchApi = require("../../twitch-api/api");
const accountAccess = require("../../common/account-access");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
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
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, username) => {
        if (username == null) {
            username = accountAccess.getAccounts().streamer.username;
        }

        const channelInfo = await TwitchApi.channels.getChannelInformationByUsername(username);

        return channelInfo != null ? channelInfo.title : "[チャンネルが見つかりません］";
    }
};

module.exports = model;