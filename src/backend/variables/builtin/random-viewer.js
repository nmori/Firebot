"use strict";
const logger = require("../../logwrapper");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const activeUserHandler = require('../../chat/chat-listeners/active-user-handler');

const model = {
    definition: {
        handle: "randomViewer",
        description: "チャットにランダムな視聴者を呼び出す。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        logger.debug("Getting random viewer...");

        const onlineViewerCount = activeUserHandler.getOnlineUserCount();

        if (onlineViewerCount === 0) {
            return "[オンラインな視聴者がいません]";
        }

        if (onlineViewerCount > 0) {
            const randomViewer = activeUserHandler.getRandomOnlineUser();
            return randomViewer ? randomViewer.username : "[視聴者を取得できない]";
        }

        return "[視聴者を取得できない]";
    }
};

module.exports = model;
