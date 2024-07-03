"use strict";

const { ComparisonType } = require("../../../../../shared/filter-constants");
const logger = require("../../../../logwrapper");

module.exports = {
    id: "streamloots:gift-purchase",
    name: "チェスト購入",
    description: "StreamLootsチェストの購入がギフトかどうかで絞り込む",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: async () => {
        return [
            {
                value: "true",
                display: "ギフト"
            },
            {
                value: "false",
                display: "ギフト以外"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {

        if (filterSettings.value == null) {
            return "[未設定]";
        }

        return filterSettings.value === "true" ? "ギフト" : "ギフト以外";
    },
    predicate: (filterSettings, eventData) => {

        const { value } = filterSettings;
        const { eventMeta } = eventData;

        const filterGiftValue = value === "true";

        const isGift = eventMeta.giftee != null;

        return filterGiftValue === isGift;
    }
};