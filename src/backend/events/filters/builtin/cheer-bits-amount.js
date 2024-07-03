"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../logwrapper");

module.exports = {
    id: "firebot:cheerbitsamount",
    name: "Cheerビッツ額",
    description: "Cheerしてくれたビッツの金額でフィルタします",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" }
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

        const bitsAmount = eventMeta.bits || 0;

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
            {
                return bitsAmount === value;
            }
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
            {
                return bitsAmount !== value;
            }
            case ComparisonType.LESS_THAN:
            case ComparisonType.ORG_LESS_THAN:
            {
                return bitsAmount < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
            {
                return bitsAmount <= value;
            }
            case ComparisonType.GREATER_THAN:
            case ComparisonType.COMPAT_GREATER_THAN:
            case ComparisonType.ORG_GREATER_THAN:
            {
                return bitsAmount > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO:
            {
                return bitsAmount >= value;
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};