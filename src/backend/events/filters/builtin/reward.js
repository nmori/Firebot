"use strict";

module.exports = {
    id: "firebot:reward",
    name: "特典",
    description: "チャンネル特典でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" }
    ],
    comparisonTypes: ["一致", "不一致"],
    valueType: "preset",
    presetValues: backendCommunicator => {
        return backendCommunicator
            .fireEventAsync("get-channel-rewards").then(rewards =>
                rewards.map(r => ({value: r.id, display: r.title})));
    },
    valueIsStillValid: (filterSettings, backendCommunicator) => {
        return new Promise(resolve => {
            backendCommunicator
                .fireEventAsync("get-channel-rewards").then(rewards => {
                    resolve(rewards.some(r => r.id === filterSettings.value));
                });
        });
    },
    getSelectedValueDisplay: (filterSettings, backendCommunicator) => {
        return new Promise(resolve => {
            backendCommunicator
                .fireEventAsync("get-channel-rewards").then(rewards => {
                    const reward = rewards.find(r => r.id === filterSettings.value);

                    resolve(reward ? reward.title : "不明な特典");
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
        case "is":
        case "一致":
            return actual === expected;
        case "is not":
        case "不一致":
            return actual !== expected;
        default:
            return false;
        }
    }
};