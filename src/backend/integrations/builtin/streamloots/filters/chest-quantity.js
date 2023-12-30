"use strict";

module.exports = {
    id: "streamloots:chest-quantity",
    name: "�`�F�X�g�̐���",
    description: "�w��/���^���ꂽStreamLoots�`�F�X�g�̐��ōi�荞��",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    comparisonTypes: ["��v", "�s��v", "����", "�ȏ�"],
    valueType: "number",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const quantity = eventMeta.quantity;

        if (quantity === undefined || quantity === null) {
            return false;
        }

        switch (comparisonType) {
        case "is":
        case "��v": {
            return quantity === value;
        }
        case "is not":
        case "�s��v": {
            return quantity !== value;
        }
        case "less than":
        case "����": {
            return quantity < value;
        }
        case "greater than":
        case "�ȏ�": {
            return quantity > value;
        }
        default:
            return false;
        }
    }
};