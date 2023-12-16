// Migration: info needed

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const viewerDB = require('../../database/userDatabase');

const model = {
    definition: {
        handle: "chatMessages",
        usage: "chatMessages[username]",
        description: "ビューアのチャットメッセージ数を表示します。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (trigger, username) => {
        if (username == null) {
            username = trigger.metadata.username;
        }
        const viewer = await viewerDB.getUserByUsername(username);
        if (!viewer) {
            return 0;
        }
        return viewer.chatMessages || 0;
    }
};

module.exports = model;
