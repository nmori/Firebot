"use strict";

module.exports = {
    id: "firebot:currency",
    name: "通貨",
    description: "通貨でフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ],
    comparisonTypes: ["一致", "不一致"],
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
            resolve(currencyService.getCurrencies().find(c => c.id === filterSettings.value)?.name ?? "不明な通貨");
        });
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const actual = eventMeta.currencyId;
        const expected = value;

        switch (comparisonType) {
        case "is":
        case "一致":
            return actual === expected;
        case "is not":
        case "不一致":
            return actual !== expected;
        default:
            return false;
        }
    }
};