"use strict";
const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../backend/logwrapper");

module.exports = {
    id: "firebot:reward",
    name: "特典",
    description: "チャンネル特典でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" }
    ],
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT
    ],
    valueType: "preset",
    presetValues: (backendCommunicator) => {
        return backendCommunicator
            .fireEventAsync("get-channel-rewards").then(rewards =>
                rewards.map(r => ({value: r.id, display: r.twitchData.title})));
    },
    valueIsStillValid: (filterSettings, backendCommunicator) => {
        return new Promise((resolve) => {
            backendCommunicator
                .fireEventAsync("get-channel-rewards").then((rewards) => {
                    resolve(rewards.some(r => r.id === filterSettings.value));
                });
        });
    },
    getSelectedValueDisplay: (filterSettings, backendCommunicator) => {
        return new Promise((resolve) => {
            backendCommunicator
                .fireEventAsync("get-channel-rewards").then((rewards) => {
                    const reward = rewards.find(r => r.id === filterSettings.value);

                    resolve(reward ? reward.twitchData.title : "不明な特典");
                });
        });
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        // normalize
        const actual = eventMeta.rewardId;
        const expected = value;

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return actual === expected;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return actual !== expected;
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};