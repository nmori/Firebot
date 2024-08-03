"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../backend/logwrapper");

module.exports = {
    id: "firebot:raid-viewer-count",
    name: "レイドで連れてきた視聴者数",
    description: "レイドで連れてきた視聴者の数でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "raid" }
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

        const raidViewerCount = eventMeta.viewerCount || 0;

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
            {
                return raidViewerCount === value;
            }
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
            {
                return raidViewerCount !== value;
            }
            case ComparisonType.LESS_THAN:
            case ComparisonType.ORG_LESS_THAN:
            {
                return raidViewerCount < value;
            }
            case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
            {
                return raidViewerCount <= value;
            }
            case ComparisonType.GREATER_THAN:
            case ComparisonType.COMPAT_GREATER_THAN:
            case ComparisonType.ORG_GREATER_THAN:
            {
                return raidViewerCount > value;
            }
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO:
            {
                return raidViewerCount >= value;
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};