"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:sub-kind",
    name: "�T�u�X�N���",
    description: "�T�u�X�N�̎�ނōi�荞�ށi�ăT�u�X�N�����T�u�X�N���j",
    events: [
        { eventSourceId: "twitch", eventId: "sub" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "first",
                display: "����"
            },
            {
                value: "resub",
                display: "�Ă�"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "first":
            return "����";
        case "resub":
            return "�Ă�";
        default:
            return "[���ݒ�]";
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