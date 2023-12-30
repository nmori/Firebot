"use strict";

module.exports = {
    id: "firebot:username",
    name: "���[�U��",
    description: "���[�U�[���Ɋ�Â�����",
    comparisonTypes: ["��v", "�s��v", "�܂�", "���K�\��"],
    leftSideValueType: "none",
    rightSideValueType: "text",
    predicate: (conditionSettings, trigger) => {

        const { comparisonType, rightSideValue } = conditionSettings;

        // normalize usernames
        const triggerUsername = trigger.metadata.username ? trigger.metadata.username.toLowerCase() : "";
        const conditionUsername = rightSideValue ? rightSideValue.toLowerCase() : "";

        switch (comparisonType) {
        case "is":
        case "��v":
            return triggerUsername === conditionUsername;
        case "is not":
        case "�s��v":
            return triggerUsername !== conditionUsername;
        case "contains":
        case "�܂�":
            return triggerUsername.includes(conditionUsername);
        case "matches regex":
        case "���K�\��": {
            const regex = new RegExp(conditionUsername, "gi");
            return regex.test(triggerUsername);
        }
    }
};