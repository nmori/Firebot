// Migration: info needed

"use strict";

const logger = require("../../logwrapper");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const viewerDB = require('../../database/userDatabase');
const twitchApi = require("../../twitch-api/api");

const model = {
    definition: {
        handle: "userId",
        usage: "userId[useridname]",
        description: "指定されたユーザー名のユーザーIDを取得します。まずローカルのユーザーデータベースを検索し、次にtwitch apiを検索します。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username) => {
        if (username == null) {
            const userId = trigger.metadata.userid ?? trigger.metadata.userId;
            if (userId != null) {
                return userId;
            }
            username = trigger.metadata.username;
            if (username == null) {
                return "[No username available]";
            }
        }
        const viewer = await viewerDB.getUserByUsername(username);
        if (viewer != null) {
            return viewer._id;
        }

        try {
            const user = await twitchApi.users.getUserByName(username);
            if (user != null) {
                return user.id;
            }
            return "[No user found]";
        } catch (error) {
            logger.debug(`Unable to find user with name "${username}"`, error);
            return "[Error]";
        }
    }
};

module.exports = model;
