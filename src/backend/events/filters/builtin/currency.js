"use strict";

module.exports = {
    id: "firebot:currency",
    name: "’Ê‰Ý",
    description: "’Ê‰Ý‚ÅƒtƒBƒ‹ƒ^",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ],
    comparisonTypes: ["ˆê’v", "•sˆê’v"],
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
            resolve(currencyService.getCurrencies().find(c => c.id === filterSettings.value)?.name ?? "•s–¾‚È’Ê‰Ý");
        });
    },
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const actual = eventMeta.currencyId;
        const expected = value;

        switch (comparisonType) {
        case "is":
        case "ˆê’v":
            return actual === expected;
        case "is not":
        case "•sˆê’v":
            return actual !== expected;
        default:
            return false;
        }
    }
};