"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

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
            case ComparisonType.IS: {
                return previousViewTime === value;
            }
            case ComparisonType.IS_NOT: {
                return previousViewTime !== value;
            }
            case ComparisonType.LESS_THAN: {
                return previousViewTime < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO: {
                return previousViewTime <= value;
            }
            case ComparisonType.GREATER_THAN: {
                return previousViewTime > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO: {
                return previousViewTime >= value;
            }
            default:
                return false;
        }
    }
};