"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmodesetting",
    name: "設定",
    description: "チャット設定でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "enabled",
                display: "有効"
            },
            {
                value: "disabled",
                display: "無効"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "enabled":
            return "有効";
        case "disabled":
            return "無効";
        default:
            return "[なし]";
        }
    },
    predicate: async (filterSettings, eventData) => {

        const { value } = filterSettings;
        const { eventMeta } = eventData;

        const chatModeStateEnabled = eventMeta.chatModeState === "enabled";

        switch (value) {
            case "enabled": {
                return chatModeStateEnabled;
            }
            case "disabled": {
                return !chatModeStateEnabled;
            }
            default:
                return !chatModeStateEnabled;
        }
    }
};