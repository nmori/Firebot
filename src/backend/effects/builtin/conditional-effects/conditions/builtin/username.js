"use strict";

module.exports = {
    id: "firebot:username",
    name: "ユーザ名",
    description: "ユーザー名に基づく条件",
    comparisonTypes: ["一致", "不一致", "含む", "正規表現"],
    leftSideValueType: "none",
    rightSideValueType: "text",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        // normalize usernames
        const triggerUsername = trigger.metadata.username ? trigger.metadata.username.toLowerCase() : "";
        const conditionUsername = rightSideValue ? rightSideValue.toLowerCase() : "";

        switch (comparisonType) {
            case "is":
            case "一致":
                return triggerUsername === conditionUsername;
            case "is not":
            case "不一致":
                return triggerUsername !== conditionUsername;
            case "contains":
            case "含む":
                return triggerUsername.includes(conditionUsername);
            case "matches regex":
            case "正規表現": {
                const regex = new RegExp(conditionUsername, "gi");
                return regex.test(triggerUsername);
            }
            default:
                return false;
        }
    }
};