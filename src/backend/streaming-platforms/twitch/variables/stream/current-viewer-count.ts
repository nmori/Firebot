import type { ReplaceVariable } from "../../../../../types/variables";
import { AccountAccess } from "../../../../common/account-access";
import { TwitchApi } from "../../api";
import logger from "../../../../logwrapper";

const model : ReplaceVariable = {
    definition: {
        handle: "currentViewerCount",
        description: "あなたの配信を視聴している人数を取得します。",
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: async () => {
        logger.debug("Getting number of viewers in chat for variable.");

        // get streamer user id
        const streamerId = AccountAccess.getAccounts().streamer.userId;

        // retrieve stream data for user id
        const twitchClient = TwitchApi.streamerClient;
        const streamInfo = await twitchClient.streams.getStreamByUserId(streamerId);

        // extract viewer count
        return streamInfo ? streamInfo.viewers : 0;
    }
};

export default model;
