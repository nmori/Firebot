"use strict";

module.exports = {
    id: "firebot:username",
    name: "ÉÜÅ[ÉUñº",
    description: "ÉÜÅ[ÉUÅ[ñºÇ…äÓÇ√Ç≠èåè",
    comparisonTypes: ["àÍív", "ïsàÍív", "ä‹Çﬁ", "ê≥ãKï\åª"],
    leftSideValueType: "none",
    rightSideValueType: "text",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        // normalize usernames
        const triggerUsername = trigger.metadata.username ? trigger.metadata.username.toLowerCase() : "";
        const conditionUsername = rightSideValue ? rightSideValue.toLowerCase() : "";

        switch (comparisonType) {
        case "is":
        case "àÍív":
            return triggerUsername === conditionUsername;
        case "is not":
        case "ïsàÍív":
            return triggerUsername !== conditionUsername;
        case "contains":
        case "ä‹Çﬁ":
            return triggerUsername.includes(conditionUsername);
        case "matches regex":
        case "ê≥ãKï\åª": {
            const regex = new RegExp(conditionUsername, "gi");
            return regex.test(triggerUsername);
        }
    }
};