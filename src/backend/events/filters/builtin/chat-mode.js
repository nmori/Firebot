"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmode",
    name: "チャットモード",
    description: "チャットモードでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "emoteonly",
                display: "エモートのみ"
            },
            {
                value: "followers",
                display: "フォロワーのみ"
            },
            {
                value: "subscribers",
                display: "サブスクライバーのみ"
            },
            {
                value: "slow",
                display: "スローモード"
            },
            {
                value: "r9kbeta",
                display: "ユニークチャット"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "emoteonly":
            return "エモートのみ";
        case "followers":
            return "フォロワーのみ";
        case "subscribers":
            return "サブスクライバーのみ";
        case "slow":
            return "スローモード";
        case "r9kbeta":
            return "ユニークチャット";
        default:
            return "[未設定]";
        }
    },
    predicate: async (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        switch (comparisonType) {
        case "is":
        case "一致":
            return eventMeta.chatMode.includes(value);
        case "is not":
        case "不一致":
            return !eventMeta.chatMode.includes(value);
        default:
            return false;
        }
    }
};