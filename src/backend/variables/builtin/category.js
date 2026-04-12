"use strict";

const TwitchApi = require("../../twitch-api/api");
const accountAccess = require("../../common/account-access");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "category",
<<<<<<< HEAD:src/backend/variables/builtin/category.js
=======
        aliases: ["game"],
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/twitch/stream/category.ts
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
<<<<<<< HEAD:src/backend/variables/builtin/category.js
    evaluator: async (_, username) => {
        if (username == null) {
            username = accountAccess.getAccounts().streamer.username;
=======
    evaluator: async (trigger, username) => {
        if (username === undefined || username == null) {
            if (trigger.metadata?.username === undefined || trigger.metadata?.username == null) {
                username = accountAccess.getAccounts().streamer.username;
            } else {
                username = trigger.metadata?.username;
            }
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/twitch/stream/category.ts
        }

        const channelInfo = await TwitchApi.channels.getChannelInformationByUsername(username);

        return channelInfo?.gameName || "";
    }
};

module.exports = model;