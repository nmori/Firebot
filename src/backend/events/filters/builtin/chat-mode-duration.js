"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmodeduration",
    name: "継続時間",
    description: "チャットモードの継続時間でフィルタリング（スロー（秒）とフォロワー（分）のみ）",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
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

        const duration = eventMeta.duration;

        if (duration == null) {
            return true;
        }

        switch (comparisonType) {
            case ComparisonType.IS: {
                return duration === value;
            }
            case ComparisonType.IS_NOT: {
                return duration !== value;
            }
            case ComparisonType.LESS_THAN: {
                return duration < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO: {
                return duration <= value;
            }
            case ComparisonType.GREATER_THAN: {
                return duration > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO: {
                return duration >= value;
            }
            default:
                return false;
        }
    }
};