"use strict";

module.exports = {
    id: "firebot:reward",
    name: "“Á“T",
    description: "ƒ`ƒƒƒ“ƒlƒ‹“Á“T‚ÅƒtƒBƒ‹ƒ^",
    events: [
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" }
    ],
    comparisonTypes: ["ˆê’v", "•sˆê’v"],
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

                    resolve(reward ? reward.title : "•s–¾‚È“Á“T");
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
        case "ˆê’v":
            return actual === expected;
        case "is not":
        case "•sˆê’v":
            return actual !== expected;
        default:
            return false;
        }
    }
};