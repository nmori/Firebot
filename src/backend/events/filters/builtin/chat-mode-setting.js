"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmodesetting",
    name: "�ݒ�",
    description: "�`���b�g�ݒ�Ńt�B���^",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "enabled",
                display: "�L��"
            },
            {
                value: "disabled",
                display: "����"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "enabled":
            return "�L��";
        case "disabled":
            return "����";
        default:
            return "[�Ȃ�]";
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