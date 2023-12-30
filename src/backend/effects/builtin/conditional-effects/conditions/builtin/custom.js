"use strict";

module.exports = {
    id: "firebot:custom",
    name: "ÉJÉXÉ^ÉÄ",
    description: "ÉJÉXÉ^ÉÄílÇ…äÓÇ√Ç≠èåè ($variables ÇégÇ§Ç∆ï÷óò)",
    comparisonTypes: ["àÍív", "ïsàÍív", "åµñßÇ…àÍív", "åµñßÇ…ïsàÍív", "ñ¢ñû", "à»â∫", "ÇÊÇËè„", "à»è„", "ä‹Çﬁ", "ä‹Ç‹Ç»Ç¢", "ê≥ãKï\åªÇ≈àÍív", "ê≥ãKï\åªÇ≈ïsàÍív"],
    leftSideValueType: "text",
    rightSideValueType: "text",
    predicate: (conditionSettings) => {

        let { comparisonType, leftSideValue, rightSideValue } = conditionSettings;

        if (comparisonType !== "is strictly" && comparisonType !== "is not strictly") {
            if (!isNaN(leftSideValue)) {
                leftSideValue = Number(leftSideValue);
            }
            if (!isNaN(rightSideValue)) {
                rightSideValue = Number(rightSideValue);
            }
        }


        switch (comparisonType) {
        case "is":
        case "àÍív":
            return leftSideValue == rightSideValue; //eslint-disable-line eqeqeq
        case "is not":
        case "ïsàÍív":
            return leftSideValue != rightSideValue; //eslint-disable-line eqeqeq
        case "is strictly":
        case "åµñßÇ…àÍív":
            return leftSideValue === rightSideValue;
        case "is not strictly":
        case "åµñßÇ…ïsàÍív":
            return leftSideValue !== rightSideValue;
        case "is less than":
        case "ñ¢ñû":
            return leftSideValue < rightSideValue;
        case "is less than or equal to":
        case "à»â∫":
            return leftSideValue <= rightSideValue;
        case "is greater than":
        case "ÇÊÇËè„":
            return leftSideValue > rightSideValue;
        case "is greater than or equal to":
        case "à»è„":
            return leftSideValue >= rightSideValue;
        case "contains":
        case "ä‹Çﬁ":
            return leftSideValue.toString().includes(rightSideValue);
        case "does not contain":
        case "ä‹Ç‹Ç»Ç¢":
            return !leftSideValue.toString().includes(rightSideValue);
        case "matches regex":
        case "ê≥ãKï\åªÇ≈àÍív": {
            const regex = new RegExp(rightSideValue, "gi");
            return regex.test(leftSideValue);
        }
        case "does not match regex":
        case "ê≥ãKï\åªÇ≈ïsàÍív": {
            const regex = new RegExp(rightSideValue, "gi");
            return !regex.test(leftSideValue);
        }
        default:
            return false;
        }
    }
};