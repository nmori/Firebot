// Migration: done

"use strict";

const apiProcessor = require("../../common/handlers/apiProcessor");
const { OutputDataType } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "randomDadJoke",
        usage: "randomDadJoke",
        description: "適当なオヤジギャグを言う！",
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: () => {
        return apiProcessor.getApiResponse("Dad Joke");
    }
};

module.exports = model;
