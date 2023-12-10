// Migration: info needed

"use strict";
const logger = require("../../logwrapper");

const activeViewerHandler = require("../../chat/chat-listeners/active-user-handler");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "activeChatUserCount",
        description: "チャットでアクティブな視聴者の数を取得します。",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async () => {
        logger.debug("Getting number of active viewers in chat.");

        return activeViewerHandler.getActiveUserCount() || 0;
    }
};

module.exports = model;
