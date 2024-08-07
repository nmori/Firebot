import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const logger = require("../../../../../backend/logwrapper");
const accountAccess = require("../../../../common/account-access");
const twitchApi = require("../../../../twitch-api/api");

const model : ReplaceVariable = {
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

export default model;
