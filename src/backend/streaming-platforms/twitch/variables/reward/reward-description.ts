import type { ReplaceVariable } from "../../../../../types/variables";
import { AccountAccess } from "../../../../common/account-access";
import { TwitchApi } from "../../api";
import channelRewardManager from "../../../../channel-rewards/channel-reward-manager";

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
        categories: ["common"],
        possibleDataOutput: ["text"]
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
                return "[特典を名前で検索できない]";
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
            return "[特典なし]";
        }

        return rewardData.rewardDescription;
    }
};

export default model;
