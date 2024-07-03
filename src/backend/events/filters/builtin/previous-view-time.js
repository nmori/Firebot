"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../logwrapper");

module.exports = {
    id: "firebot:previous-view-time",
    name: "前回の表示時間",
    description: "視聴者の前回の表示時間で絞り込む（単位：時間）",
    events: [
        { eventSourceId: "firebot", eventId: "view-time-update" }
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

        const previousViewTime = eventMeta.previousViewTime || 0;

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
            {
                return previousViewTime === value;
            }
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
            {
                return previousViewTime !== value;
            }
            case ComparisonType.LESS_THAN:
            case ComparisonType.ORG_LESS_THAN:
            {
                return previousViewTime < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
            {
                return previousViewTime <= value;
            }
            case ComparisonType.GREATER_THAN:
            case ComparisonType.COMPAT_GREATER_THAN:
            case ComparisonType.ORG_GREATER_THAN:
            {
                return previousViewTime > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO:
            {
                return previousViewTime >= value;
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};