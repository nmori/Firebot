"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../logwrapper");

module.exports = {
    id: "firebot:currency",
    name: "通貨",
    description: "通貨でフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ],
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT
    ],
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
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.COMPAT2_IS:
            case ComparisonType.ORG_IS:
                return actual === expected;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.COMPAT2_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return actual !== expected;
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};