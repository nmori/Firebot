"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmode",
    name: "�`���b�g���[�h",
    description: "�`���b�g���[�h�Ńt�B���^",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "emoteonly",
                display: "�G���[�g�̂�"
            },
            {
                value: "followers",
                display: "�t�H�����[�̂�"
            },
            {
                value: "subscribers",
                display: "�T�u�X�N���C�o�[�̂�"
            },
            {
                value: "slow",
                display: "�X���[���[�h"
            },
            {
                value: "r9kbeta",
                display: "���j�[�N�`���b�g"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "emoteonly":
            return "�G���[�g�̂�";
        case "followers":
            return "�t�H�����[�̂�";
        case "subscribers":
            return "�T�u�X�N���C�o�[�̂�";
        case "slow":
            return "�X���[���[�h";
        case "r9kbeta":
            return "���j�[�N�`���b�g";
        default:
            return "[���ݒ�]";
        }
    },
    predicate: async (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        switch (comparisonType) {
        case "is":
        case "��v":
            return eventMeta.chatMode.includes(value);
        case "is not":
        case "�s��v":
            return !eventMeta.chatMode.includes(value);
        default:
            return false;
        }
    }
};