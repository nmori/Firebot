"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const frontendCommunicator = require("../../common/frontend-communicator");

const model = {
    definition: {
        handle: "audioDuration",
        usage: "audioDuration[filePathOrUrl]",
        description: "オーディオの長さを取得しようとします。",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (trigger, url) => {
        if (url == null) {
            return "[NO URL PROVIDED]";
        }
        try {
            return await frontendCommunicator.fireEventAsync("getSoundDuration", {
                path: url
            });
        } catch (err) {
            return "[ERROR FETCHING DURATION]";
        }
    }
};

module.exports = model;
