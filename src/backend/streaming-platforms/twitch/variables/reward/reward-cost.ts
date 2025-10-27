import type { ReplaceVariable } from "../../../../../types/variables";
import { AccountAccess } from "../../../../common/account-access";
import { TwitchApi } from "../../api";
import channelRewardManager from "../../../../channel-rewards/channel-reward-manager";


const model : ReplaceVariable = {
    definition: {
        handle: "rewardCost",
        description: "特典金額を表示します",
        examples: [
            {
                usage: "rewardCost[rewardName]",
                description: "チャンネルポイント特典の金額。名前は正確である必要があります"
            }
        ],
        categories: ["common"],
        possibleDataOutput: ["number"]
    },
    evaluator: async (trigger, rewardName: string) => {
        let rewardData;
        if (!rewardName) {
            rewardData = trigger.metadata.eventData ?
                trigger.metadata.eventData :
                trigger.metadata;
        } else {
            const channelRewardId = channelRewardManager.getChannelRewardIdByName(rewardName);

            if (channelRewardId == null) {
                return -1;
            }

            const reward = await TwitchApi.streamerClient.channelPoints.getCustomRewardById(
                AccountAccess.getAccounts().streamer.userId,
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
            return -1;
        }

        return rewardData.rewardCost;
    }
};

export default model;
