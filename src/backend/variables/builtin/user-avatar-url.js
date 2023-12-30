"use strict";

const twitchApi = require("../../twitch-api/api");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "userAvatarUrl",
        usage: "userAvatarUrl",
        description: "関連するユーザー（コマンドを実行したユーザー、ボタンを押したユーザーなど）のアバターのURLを取得します。",
        examples: [
            {
                usage: "userAvatarUrl[$target]",
                description: "コマンドの中で、ターゲットユーザーのアバターのURLを取得します。"
            },
            {
                usage: "userAvatarUrl[ebiggz]",
                description: "特定のユーザーのアバターのURLを取得します。"
            }
        ],
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username) => {
        if (username == null) {
            username = trigger.metadata.username;
        }

        try {
            const userInfo = await twitchApi.users.getUserByName(username);
            return userInfo.profilePictureUrl ? userInfo.profilePictureUrl : "[No Avatar Found]";
        } catch (err) {
            return "[No Avatar Found]";
        }
    }
};

module.exports = model;