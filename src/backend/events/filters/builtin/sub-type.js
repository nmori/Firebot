"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:sub-type",
    name: "�T�u�X�N���x��",
    description: "�T�u�X�N��Tier���x���Ńt�B���^�����O�i�v���C���A�e�B�A1�A2�A3�Ȃǁj",
    events: [
        { eventSourceId: "twitch", eventId: "sub" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" },
        { eventSourceId: "twitch", eventId: "prime-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "gift-sub-upgraded" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
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
            return "[���ݒ�]";
        }
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        if (value == null) {
            return true;
        }

        const subPlan = eventMeta.subPlan;

        if (comparisonType === ComparisonType.IS) {
            return subPlan === value;
        } else if (comparisonType === ComparisonType.IS_NOT) {
            return subPlan !== value;
        }

        return true;
    }
};