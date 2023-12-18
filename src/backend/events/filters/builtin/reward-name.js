"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:reward-name",
    name: "チャンネル特典の名前",
    description: "チャンネル特典名でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT, ComparisonType.CONTAINS, ComparisonType.INCLUDING,ComparisonType.MATCHES_REGEX],
    valueType: "text",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        // normalize
        const actual = eventMeta.rewardName ? eventMeta.rewardName.toLowerCase() : "";
        const expected = value ? value.toLowerCase() : "";

        switch (comparisonType) {
        case ComparisonType.IS:
            return actual === expected;
        case ComparisonType.IS_NOT:
            return actual !== expected;
        case ComparisonType.CONTAINS:
            return actual.includes(expected);
        case  ComparisonType.INCLUDING:
            return actual.indexOf(expected)>=0;
        case ComparisonType.MATCHES_REGEX: {
            const regex = new RegExp(expected, "gi");
            return regex.test(actual);
        }
        default:
            return false;
        }
    }
};