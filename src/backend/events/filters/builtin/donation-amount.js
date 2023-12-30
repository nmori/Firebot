"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:donation-amount",
    name: "ドネーション金額",
    description: "StreamLabs/Tipeee/ExtraLifeからのドネーション金額で絞り込む",
    events: [
        { eventSourceId: "streamlabs", eventId: "donation" },
        { eventSourceId: "streamlabs", eventId: "eldonation" },
        { eventSourceId: "extralife", eventId: "donation" },
        { eventSourceId: "tipeeestream", eventId: "donation" },
        { eventSourceId: "streamelements", eventId: "donation" }
    ],
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT,
        ComparisonType.LESS_THAN,
        ComparisonType.LESS_THAN_OR_EQUAL_TO,
        ComparisonType.GREATER_THAN,
        ComparisonType.GREATER_THAN_OR_EQUAL_TO
    ],
    valueType: "number",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const donationAmount = eventMeta.donationAmount || 0;

        switch (comparisonType) {
            case ComparisonType.IS: {
                return donationAmount === value;
            }
            case ComparisonType.IS_NOT: {
                return donationAmount !== value;
            }
            case ComparisonType.LESS_THAN: {
                return donationAmount < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO: {
                return donationAmount <= value;
            }
            case ComparisonType.GREATER_THAN: {
                return donationAmount > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO: {
                return donationAmount >= value;
            }
            default:
                return false;
        }
    }
};