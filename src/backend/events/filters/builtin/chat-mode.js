"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../logwrapper");

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
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.COMPAT2_IS:
            case ComparisonType.ORG_IS:
                return eventMeta.chatMode.includes(value);
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.COMPAT2_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return !eventMeta.chatMode.includes(value);
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};