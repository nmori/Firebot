"use strict";
const { ComparisonType } = require("../../../../../../shared/filter-constants");
const logger = require("../../../../../logwrapper");

module.exports = {
    id: "firebot:username",
    name: "ユーザ名",
    description: "ユーザー名に基づく条件",
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT,
        ComparisonType.CONTAINS,
        ComparisonType.MATCHES_REGEX
    ],
    leftSideValueType: "none",
    rightSideValueType: "text",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        // normalize usernames
        const triggerUsername = trigger.metadata.username ? trigger.metadata.username.toLowerCase() : "";
        const conditionUsername = rightSideValue ? rightSideValue.toLowerCase() : "";

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return triggerUsername === conditionUsername;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return triggerUsername !== conditionUsername;
            case ComparisonType.CONTAINS:
            case ComparisonType.COMPAT_CONTAINS:
            case ComparisonType.ORG_CONTAINS:
                return triggerUsername.includes(conditionUsername);
            case ComparisonType.MATCHES_REGEX:
            case ComparisonType.ORG_MATCHES_REGEX:
            {
                const regex = new RegExp(conditionUsername, "gi");
                return regex.test(triggerUsername);
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};