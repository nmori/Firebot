"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const frontendCommunicator = require("../../common/frontend-communicator");
const logger = require("../../logwrapper");

const model = {
    definition: {
        handle: "videoDuration",
        usage: "videoDuration[filePathOrUrl]",
        description: "ビデオの再生時間を取得",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, url) => {
        if (url == null) {
            return "[URLなし]";
        }
        const result = await frontendCommunicator.fireEventAsync("getVideoDuration", url);

        if (isNaN(result)) {
            logger.error("Error while retrieving video duration", result);
            return "[時間の取得エラー]";
        }
        return result;
    }
};

module.exports = model;
