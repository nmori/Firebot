// Migration: done

const logger = require("../../../../../backend/logwrapper");
const accountAccess = require("../../../../common/account-access");
const twitchApi = require("../../../../twitch-api/api");

const logger = require("../../logwrapper");
const accountAccess = require("../../common/account-access");
const twitchApi = require("../../twitch-api/api");

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "currentViewerCount",
        description: "縺ゅ↑縺溘・驟堺ｿ｡繧定ｦ冶・縺励※縺・ｋ莠ｺ謨ｰ繧貞叙蠕励＠縺ｾ縺吶・,
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
