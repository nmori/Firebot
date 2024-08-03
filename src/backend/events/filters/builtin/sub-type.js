"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../backend/logwrapper");

module.exports = {
    id: "firebot:sub-type",
    name: "サブスクレベル",
    description: "サブスクのTierレベルでフィルタリング（プライム、ティア1、2、3など）",
    events: [
        { eventSourceId: "twitch", eventId: "sub" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" },
        { eventSourceId: "twitch", eventId: "prime-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "gift-sub-upgraded" }
    ],
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT,
        ComparisonType.GREATER_THAN_OR_EQUAL_TO,
        ComparisonType.LESS_THAN_OR_EQUAL_TO
    ],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "Prime",
                display: "Prime"
            },
            {
                value: "1000",
                display: "Tier 1"
            },
            {
                value: "2000",
                display: "Tier 2"
            },
            {
                value: "3000",
                display: "Tier 3"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
            case "Prime":
                return "Prime";
            case "1000":
                return "Tier 1";
            case "2000":
                return "Tier 2";
            case "3000":
                return "Tier 3";
            default:
                return "[未設定]";
        }
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        if (value == null) {
            return true;
        }

        const subPlan = eventMeta.subPlan;

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return subPlan === value;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return subPlan !== value;
            case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_GREATER_THAN_OR_EQUAL_TO:
                if (value === "3000") { return subPlan === "3000"; }
                if (value === "2000") { return subPlan === "2000" || subPlan === "3000"; }
                if (value === "1000") { return subPlan === "1000" || subPlan === "2000" || subPlan === "3000"; }
                if (value === "Prime") { return subPlan === "1000" || subPlan === "2000" || subPlan === "3000" || subPlan === "Prime"; }
                return false;
            case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
                if (value === "3000") { return subPlan === "Prime" || subPlan === "1000" || subPlan === "2000" || subPlan === "3000"; }
                if (value === "2000") { return subPlan === "Prime" || subPlan === "1000" || subPlan === "2000"; }
                if (value === "1000") { return subPlan === "Prime" || subPlan === "1000"; }
                if (value === "Prime") { return subPlan === "Prime"; }
                return false;

            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return true;
        }
    }
};