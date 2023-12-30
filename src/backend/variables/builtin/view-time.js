// Migration: info - Need implementation details

"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const viewerDB = require('../../database/userDatabase');

const model = {
    definition: {
        handle: "viewTime",
        usage: "viewTime[username]",
        description: "指定された視聴者の表示時間（時間単位）を表示します（現在の視聴者を使用する場合は空白のままにします）。",
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
        return viewer.minutesInChannel < 60 ? 0 : parseInt(viewer.minutesInChannel / 60);
    }
};

module.exports = model;
