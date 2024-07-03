"use strict";

const { ComparisonType } = require("../../../../../shared/filter-constants");
const logger = require("../../../../logwrapper");

module.exports = {
    id: "streamloots:card-name",
    name: "カード名",
    description: "StreamLoots のカード名でフィルタ",
    events: [
        { eventSourceId: "streamloots", eventId: "redemption" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT, ComparisonType.CONTAINS, ComparisonType.MATCHES_REGEX],
    valueType: "text",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        let cardName = eventMeta.cardName;

        if (!cardName) {
            return false;
        }

        cardName = cardName.toLowerCase();

        const filterCardName = value && value.toLowerCase();

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return cardName === filterCardName;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return cardName !== filterCardName;
            case ComparisonType.CONTAINS:
            case ComparisonType.COMPAT_CONTAINS:
            case ComparisonType.ORG_CONTAINS:
                return cardName.includes(filterCardName);
            case ComparisonType.MATCHES_REGEX:
            case ComparisonType.COMPAT_MATCHES_REGEX:
            case ComparisonType.ORG_MATCHES_REGEX:
            {
                const regex = new RegExp(filterCardName, "gi");
                return regex.test(cardName);
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};