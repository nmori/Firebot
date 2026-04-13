"use strict";

function normalizeCustomComparisonType(comparisonType) {
    const aliasMap = new Map([
        ["等しい", "is"],
        ["is", "is"],
        ["等しくない", "is not"],
        ["is not", "is not"],
        ["厳格に一致", "is strictly"],
        ["is strictly", "is strictly"],
        ["厳格に不一致", "is not strictly"],
        ["is not strictly", "is not strictly"],
        ["より小さい", "is less than"],
        ["is less than", "is less than"],
        ["以下", "is less than or equal to"],
        ["is less than or equal to", "is less than or equal to"],
        ["より大きい", "is greater than"],
        ["is greater than", "is greater than"],
        ["以上", "is greater than or equal to"],
        ["is greater than or equal to", "is greater than or equal to"],
        ["含む", "contains"],
        ["contains", "contains"],
        ["含まない", "does not contain"],
        ["does not contain", "does not contain"],
        ["含む（大文字小文字を区別しない）", "contains (case-insensitive)"],
        ["contains (case-insensitive)", "contains (case-insensitive)"],
        ["含まない（大文字小文字を区別しない）", "does not contain (case-insensitive)"],
        ["does not contain (case-insensitive)", "does not contain (case-insensitive)"],
        ["正規表現に一致", "matches regex"],
        ["matches regex", "matches regex"],
        ["正規表現に一致しない", "does not match regex"],
        ["does not match regex", "does not match regex"]
    ]);

    return aliasMap.get(comparisonType) ?? comparisonType;
}

module.exports = {
    id: "firebot:custom",
    name: "カスタム",
    description: "カスタム値に基づく条件 ($variables を使うと便利)",
    comparisonTypes: [
        "等しい",
        "等しくない",
        "厳格に一致",
        "厳格に不一致",
        "より小さい",
        "以下",
        "より大きい",
        "以上",
        "含む",
        "含まない",
        "含む（大文字小文字を区別しない）",
        "含まない（大文字小文字を区別しない）",
        "正規表現に一致",
        "正規表現に一致しない"
    ],
    leftSideValueType: "text",
    rightSideValueType: "text",
    predicate: (conditionSettings) => {
        let { comparisonType, leftSideValue, rightSideValue } = conditionSettings;
        const normalizedComparisonType = normalizeCustomComparisonType(comparisonType);

        if (normalizedComparisonType !== "is strictly" && normalizedComparisonType !== "is not strictly") {
            if (!isNaN(leftSideValue)) {
                leftSideValue = Number(leftSideValue);
            }
            if (!isNaN(rightSideValue)) {
                rightSideValue = Number(rightSideValue);
            }
        }

        switch (normalizedComparisonType) {
            case "is":
                return leftSideValue == rightSideValue; //eslint-disable-line eqeqeq
            case "is not":
                return leftSideValue != rightSideValue; //eslint-disable-line eqeqeq
            case "is strictly":
                return leftSideValue === rightSideValue;
            case "is not strictly":
                return leftSideValue !== rightSideValue;
            case "is less than":
                return leftSideValue < rightSideValue;
            case "is less than or equal to":
                return leftSideValue <= rightSideValue;
            case "is greater than":
                return leftSideValue > rightSideValue;
            case "is greater than or equal to":
                return leftSideValue >= rightSideValue;
            case "contains":
                return leftSideValue.toString().includes(rightSideValue);
            case "does not contain":
                return !leftSideValue.toString().includes(rightSideValue);
            case "contains (case-insensitive)":
                return `${leftSideValue}`.toLowerCase().includes(`${rightSideValue}`.toLowerCase());
            case "does not contain (case-insensitive)":
                return !`${leftSideValue}`.toLowerCase().includes(`${rightSideValue}`.toLowerCase());
            case "matches regex": {
                const regex = new RegExp(rightSideValue, "gi");
                return regex.test(leftSideValue);
            }
            case "does not match regex": {
                const regex = new RegExp(rightSideValue, "gi");
                return !regex.test(leftSideValue);
            }
            default:
                return false;
        }
    }
};
