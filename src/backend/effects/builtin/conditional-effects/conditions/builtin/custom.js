"use strict";

module.exports = {
    id: "firebot:custom",
    name: "カスタム",
    description: "カスタム値に基づく条件 ($variables を使うと便利)",
    comparisonTypes: ["一致", "不一致", "厳密に一致", "厳密に不一致", "未満", "以下", "より上", "以上", "含む", "含まない", "正規表現で一致", "正規表現で不一致"],
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
        case "一致":
            return leftSideValue == rightSideValue; //eslint-disable-line eqeqeq
        case "is not":
        case "不一致":
            return leftSideValue != rightSideValue; //eslint-disable-line eqeqeq
        case "is strictly":
        case "厳密に一致":
            return leftSideValue === rightSideValue;
        case "is not strictly":
        case "厳密に不一致":
            return leftSideValue !== rightSideValue;
        case "is less than":
        case "未満":
            return leftSideValue < rightSideValue;
        case "is less than or equal to":
        case "以下":
            return leftSideValue <= rightSideValue;
        case "is greater than":
        case "より上":
            return leftSideValue > rightSideValue;
        case "is greater than or equal to":
        case "以上":
            return leftSideValue >= rightSideValue;
        case "contains":
        case "含む":
            return leftSideValue.toString().includes(rightSideValue);
        case "does not contain":
        case "含まない":
            return !leftSideValue.toString().includes(rightSideValue);
        case "matches regex":
        case "正規表現で一致": {
            const regex = new RegExp(rightSideValue, "gi");
            return regex.test(leftSideValue);
        }
        case "does not match regex":
        case "正規表現で不一致": {
            const regex = new RegExp(rightSideValue, "gi");
            return !regex.test(leftSideValue);
        }
        default:
            return false;
        }
    }
};