"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:custom-variable-name",
    name: "カスタム変数名",
    description: "カスタム変数名でフィルタをかける",
    events: [
        { eventSourceId: "firebot", eventId: "custom-variable-set" },
        { eventSourceId: "firebot", eventId: "custom-variable-expired" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT, ComparisonType.CONTAINS, ComparisonType.INCLUDING, ComparisonType.MATCHES_REGEX],
    valueType: "text",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        // normalize
        const actual = eventMeta.createdCustomVariableName ?? eventMeta.expiredCustomVariableName ?? "";
        const expected = value ?? "";

        switch (comparisonType) {
        case ComparisonType.IS:
            return actual === expected;
        case ComparisonType.IS_NOT:
            return actual !== expected;
        case ComparisonType.CONTAINS:
            return actual.includes(expected);
        case  ComparisonType.INCLUDING:
            return actual.indexOf(expected)>=0;            
        case ComparisonType.MATCHES_REGEX: {
            const regex = new RegExp(expected, "gi");
            return regex.test(actual);
        }
        default:
            return false;
        }
    }
};