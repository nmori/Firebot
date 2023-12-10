"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:is-anonymous",
    name: "匿名の視聴者",
    description: "イベントが匿名の視聴者によって起動されたかどうかでフィルタリングする。",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "true",
                display: "はい"
            },
            {
                value: "false",
                display: "いいえ"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {

        if (filterSettings.value == null) {
            return "いいえ";
        }

        return filterSettings.value === "true" ? "はい" : "いいえ";
    },
    predicate: (filterSettings, eventData) => {

        const { value } = filterSettings;
        const { eventMeta } = eventData;

        const isAnonymous = eventMeta.isAnonymous === true;

        return value === "true" ? isAnonymous : !isAnonymous;
    }
};