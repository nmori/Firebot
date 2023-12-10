"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "rewardImageUrl",
        description: "賞の画像URL",
        examples: [
            {
                usage: "rewardDescription[rewardName]",
                description: "与えられた報酬の説明。名前は正確でなければならない！"
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
            const channelRewardManager = require("../../channel-rewards/channel-reward-manager");
            const twitchApi = require("../../twitch-api/api");
            const accountAccess = require("../../common/account-access");

            const channelRewardId = channelRewardManager.getChannelRewardIdByName(rewardName);

            if (channelRewardId == null) {
                return "[報酬を名前で検索できない]";
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
            return "[報酬なし］";
        }

        return rewardData.rewardImage;
    }
};

module.exports = model;
