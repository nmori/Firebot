"use strict";

module.exports = {
    id: "firebot:currency",
    name: "�ʉ�",
    description: "�ʉ݂Ńt�B���^",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ],
    comparisonTypes: ["��v", "�s��v"],
    valueType: "preset",
    presetValues: currencyService => {
        return currencyService
            .getCurrencies().map(c => ({value: c.id, display: c.name}));
    },
    valueIsStillValid: (filterSettings, currencyService) => {
        return new Promise(resolve => {
            resolve(currencyService.getCurrencies().some(c => c.id === filterSettings.value));
        });
    },
    getSelectedValueDisplay: (filterSettings, currencyService) => {
        return new Promise(resolve => {
            resolve(currencyService.getCurrencies().find(c => c.id === filterSettings.value)?.name ?? "�s���Ȓʉ�");
        });
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const actual = eventMeta.currencyId;
        const expected = value;

        switch (comparisonType) {
        case "is":
        case "��v":
            return actual === expected;
        case "is not":
        case "�s��v":
            return actual !== expected;
        default:
            return false;
        }
    }
};