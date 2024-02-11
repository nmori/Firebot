"use strict";

const twitchApi = require("../../twitch-api/api");
const accountAccess = require("../../common/account-access");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "categoryImageUrl",
        usage: "categoryImageUrl",
        description: "最後に配信されたカテゴリの画像のURLを取得します。",
        examples: [
            {
                usage: "categoryImageUrl[$target]",
                description: "コマンドの場合、ターゲットチャンネルで最後に配信されたカテゴリの画像のURLを取得します。"
            },
            {
                usage: "categoryImageUrl[$user]",
                description: "関連するユーザー(コマンドをトリガーした、ボタンを押したなど)の最後に配信されたカテゴリの画像のURLを取得します。"
            },
            {
                usage: "categoryImageUrl[ebiggz]",
                description: "特定のチャンネルで最後に配信されたカテゴリの画像URLを取得します。"
            },
            {
                usage: "categoryImageUrl[ebiggz, 285x380]",
                description: "異なる画像サイズを取得する（アスペクト比4:3を使用）。デフォルトは285x380です。"
            }
        ],
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, username, size = "285x380") => {
        if (username == null) {
            username = accountAccess.getAccounts().streamer.username;
        }

        try {
            const channelInfo = await twitchApi.channels.getChannelInformationByUsername(username);
            const category = await twitchApi.categories.getCategoryById(channelInfo.gameId, size);

            return category.boxArtUrl ? category.boxArtUrl : "[No Category Image Found]";
        } catch (err) {
            return "[No Category Image Found]";
        }
    }
};

module.exports = model;