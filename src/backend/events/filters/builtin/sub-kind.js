"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:sub-kind",
    name: "サブスク状態",
    description: "サブスクの種類で絞り込む（再サブスクか初サブスクか）",
    events: [
        { eventSourceId: "twitch", eventId: "sub" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "first",
                display: "初回"
            },
            {
                value: "resub",
                display: "再び"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "first":
            return "初回";
        case "resub":
            return "再び";
        default:
            return "[未設定]";
        }
    },
    predicate: (filterSettings, eventData) => {

        const { value } = filterSettings;
        const { eventMeta } = eventData;

        if (value == null) {
            return true;
        }

        const isResub = eventMeta.isResub;
        const expectingResub = value === 'resub';

        return isResub === expectingResub;
    }
};