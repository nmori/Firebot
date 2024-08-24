import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const model : ReplaceVariable = {
    definition: {
        handle: "rewardDescription",
        description: "特典の説明",
        examples: [
            {
                usage: "rewardDescription[rewardName]",
                description: "与えられた特典の説明。名前は正確でなければならない！"
            }
        ],
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, rewardName) => {
        let rewardData;
        if (!rewardName) {
            rewardData = trigger.metadata.eventData ?
                trigger.metadata.eventData :
                trigger.metadata;
        } else {
            const channelRewardManager = require("../../../../channel-rewards/channel-reward-manager");
            const twitchApi = require("../../../../twitch-api/api");
            const accountAccess = require("../../../../common/account-access");

            const channelRewardId = channelRewardManager.getChannelRewardIdByName(rewardName);

            if (channelRewardId == null) {
                return "[特典を名前で検索できない]";
            }

            const reward = await twitchApi.streamerClient.channelPoints.getCustomRewardById(
                accountAccess.getAccounts().streamer.userId,
                channelRewardId
            );
            if (reward) {
                rewardData = {
                    rewardImage: reward.getImageUrl(4),
                    rewardName: reward.title,
                    rewardDescription: reward.prompt,
                    rewardCost: reward.cost
                };
            }
        }

        if (rewardData == null) {
            return "[特典なし]";
        }

        return rewardData.rewardDescription;
    }
};

export default model;
