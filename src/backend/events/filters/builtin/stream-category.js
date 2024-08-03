"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../backend/logwrapper");

module.exports = {
    id: "firebot:category-changed",
    name: "カテゴリ",
    description: "現在選択されているストリーミング先のカテゴリでフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "category-changed" },
        { eventSourceId: "twitch", eventId: "category-changed" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT, ComparisonType.CONTAINS, ComparisonType.MATCHES_REGEX],
    valueType: "text",
    predicate: (filterSettings, eventData) => {
        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const eventCategory = eventMeta.category ? eventMeta.category.toLowerCase() : "";
        const filterCategory = value ? value.toLowerCase() : "";

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return eventCategory === filterCategory;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return eventCategory !== filterCategory;
            case ComparisonType.CONTAINS:
            case ComparisonType.COMPAT_CONTAINS:
            case ComparisonType.ORG_CONTAINS:
                return eventCategory.includes(filterCategory);
            case ComparisonType.MATCHES_REGEX:
            case ComparisonType.COMPAT_MATCHES_REGEX:
            case ComparisonType.ORG_MATCHES_REGEX:
            {
                const regex = new RegExp(filterCategory, "gi");
                return regex.test(eventCategory);
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};