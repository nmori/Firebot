"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../logwrapper");

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
            case ComparisonType.IS:
            case ComparisonType.COMAPT_IS:
            case ComparisonType.ORG_IS:
            {
                return donationAmount === value;
            }
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
            {
                return donationAmount !== value;
            }
            case ComparisonType.LESS_THAN:
            case ComparisonType.ORG_LESS_THAN:
            {
                return donationAmount < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
            {
                return donationAmount <= value;
            }
            case ComparisonType.GREATER_THAN:
            case ComparisonType.COMPAT_GREATER_THAN:
            case ComparisonType.ORG_GREATER_THAN:
            {
                return donationAmount > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO:
            {
                return donationAmount >= value;
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};