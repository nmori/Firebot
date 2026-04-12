// Migration: done

<<<<<<< HEAD:src/backend/variables/builtin/current-viewer-count.js
"use strict";
=======
const logger = require("../../../../../backend/logwrapper");
const accountAccess = require("../../../../common/account-access");
const twitchApi = require("../../../../twitch-api/api");
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/variables/builtin/twitch/stream/current-viewer-count.ts

const logger = require("../../logwrapper");
const accountAccess = require("../../common/account-access");
const twitchApi = require("../../twitch-api/api");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "currentViewerCount",
        description: "あなたの配信を視聴している人数を取得します。",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async () => {
        logger.debug("Getting number of viewers in chat for variable.");

        // get streamer user id
        const streamerId = accountAccess.getAccounts().streamer.userId;

        // retrieve stream data for user id
        const twitchClient = twitchApi.streamerClient;
        const streamInfo = await twitchClient.streams.getStreamByUserId(streamerId);

        // extract viewer count
        return streamInfo ? streamInfo.viewers : 0;
    }
};

module.exports = model;
