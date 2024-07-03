"use strict";

const { ComparisonType } = require("../../../../../shared/filter-constants");
const logger = require("../../../../logwrapper");

module.exports = {
    id: "streamloots:card-rarity",
    name: "カードレアリティ",
    description: "交換したストリームルーツカードのレアリティで絞り込む",
    events: [
        { eventSourceId: "streamloots", eventId: "redemption" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: async () => {
        return [
            {
                value: "common",
                display: "Common"
            },
            {
                value: "rare",
                display: "Rare"
            },
            {
                value: "epic",
                display: "Epic"
            },
            {
                value: "legendary",
                display: "Legendary"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {

        const capitalize = ([first, ...rest]) =>
            first.toUpperCase() + rest.join("").toLowerCase();

        if (filterSettings.value == null) {
            return "[未設定]";
        }

        return capitalize(filterSettings.value);
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const cardRarity = eventMeta.cardRarity;

        if (!cardRarity) {
            return false;
        }
        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return  value === cardRarity;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return value !== cardRarity;
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};