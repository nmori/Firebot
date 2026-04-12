"use strict";
const { ComparisonType } = require("../../../../../../shared/filter-constants");
const logger = require("../../../../../logwrapper");

module.exports = {
    id: "firebot:custom",
    name: "カスタム",
    description: "カスタム値に基づく条件 ($variables を使うと便利)",
<<<<<<< HEAD
    comparisonTypes: ["一致", "不一致", "厳密に一致", "厳密に不一致", "未満", "以下", "より上", "以上", "含む", "含まない", "正規表現で一致", "正規表現で不一致"],
=======
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT,
        ComparisonType.IS_STRICTLY,
        ComparisonType.IS_NOT_STRICTLY,
        ComparisonType.LESS_THAN,
        ComparisonType.LESS_THAN_OR_EQUAL_TO,
        ComparisonType.GREATER_THAN,
        ComparisonType.GREATER_THAN_OR_EQUAL_TO,
        ComparisonType.CONTAINS,
        ComparisonType.DOES_NOT_CONTAIN,
        ComparisonType.MATCHES_REGEX_CS,
        ComparisonType.DOES_NOT_MATCH_REGEX_CS,
        ComparisonType.MATCHES_REGEX,
        ComparisonType.DOES_NOT_MATCH_REGEX
    ],
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
    leftSideValueType: "text",
    rightSideValueType: "text",
    predicate: (conditionSettings) => {

        let { comparisonType, leftSideValue, rightSideValue } = conditionSettings;

        if (
            comparisonType !== ComparisonType.IS_STRICTKY &&
            comparisonType !== ComparisonType.IS_NOT_STRICTKY &&
            comparisonType !== ComparisonType.ORG_IS_STRICTKY &&
            comparisonType !== ComparisonType.ORG_IS_NOT_STRICTKY
        ) {
            if (!isNaN(leftSideValue)) {
                leftSideValue = Number(leftSideValue);
            }
            if (!isNaN(rightSideValue)) {
                rightSideValue = Number(rightSideValue);
            }
        }


        switch (comparisonType) {
<<<<<<< HEAD
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
=======
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.COMPAT2_IS:
            case ComparisonType.ORG_IS:
                return leftSideValue == rightSideValue; //eslint-disable-line eqeqeq
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.COMPAT2_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return leftSideValue != rightSideValue; //eslint-disable-line eqeqeq

            case ComparisonType.IS_STRICTLY:
            case ComparisonType.ORG_IS_STRICTLY:
                return leftSideValue === rightSideValue;

            case ComparisonType.IS_NOT_STRICTLY:
            case ComparisonType.ORG_IS_NOT_STRICTLY:
                return leftSideValue !== rightSideValue;

            case ComparisonType.LESS_THAN:
            case ComparisonType.ORG_LESS_THAN:
                return leftSideValue < rightSideValue;

            case ComparisonType.LESS_THAN_OR_EQUAL_TO:
            case ComparisonType.ORG_LESS_THAN_OR_EQUAL_TO:
                return leftSideValue <= rightSideValue;

            case ComparisonType.GREATER_THAN:
            case ComparisonType.COMPAT_GREATER_THAN:
                return leftSideValue > rightSideValue;

            case ComparisonType.GREATER_THAN_OR_EQUAL_TO:
                return leftSideValue >= rightSideValue;

            case ComparisonType.CONTAINS:
            case ComparisonType.COMPAT_CONTAINS:
            case ComparisonType.COMPAT2_CONTAINS:
            case ComparisonType.ORG_CONTAINS:
                return leftSideValue.toString().includes(rightSideValue);

            case ComparisonType.DOES_NOT_CONTAIN:
            case ComparisonType.COMPAT_DOESNT_CONTAIN:
            case ComparisonType.COMPAT2_DOESNT_CONTAIN:
            case ComparisonType.ORG_DOESNT_CONTAIN:
                return !leftSideValue.toString().includes(rightSideValue);
            case "contains (case-insensitive)":
                return `${leftSideValue}`.toLowerCase().includes(`${rightSideValue}`.toLowerCase());
            case "does not contain (case-insensitive)":
                return !`${leftSideValue}`.toLowerCase().includes(`${rightSideValue}`.toLowerCase());


            case ComparisonType.MATCHES_REGEX_CS:
            case ComparisonType.COMPAT2_MATCHES_REGEX_CS:
            case ComparisonType.ORG_MATCHES_REGEX_CS:
            {
                const regex = new RegExp(rightSideValue, "gi");
                return regex.test(leftSideValue);
            }

            case ComparisonType.DOESNT_MATCH_REGEX_CS:
            case ComparisonType.COMPAT2_DOESNT_MATCH_REGEX_CS:
            case ComparisonType.ORG_DOESNT_MATCH_REGEX_CS:
            {
                const regex = new RegExp(rightSideValue, "gi");
                return !regex.test(leftSideValue);
            }

            case ComparisonType.MATCHES_REGEX:
            case ComparisonType.COMPAT_MATCHES_REGEX:
            case ComparisonType.COMPAT2_MATCHES_REGEX:
            case ComparisonType.ORG_MATCHES_REGEX:
            {
                const regex = new RegExp(rightSideValue, "g");
                return regex.test(leftSideValue);
            }

            case ComparisonType.DOESNT_MATCH_REGEX:
            case ComparisonType.COMPAT_DOESNT_MATCH_REGEX:
            case ComparisonType.COMPAT2_DOESNT_MATCH_REGEX:
            case ComparisonType.ORG_DOESNT_MATCH_REGEX:
            {
                const regex = new RegExp(rightSideValue, "g");
                return !regex.test(leftSideValue);
            }

            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
        }
    }
};