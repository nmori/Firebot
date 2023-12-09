"use strict";

/**
 * Enum for effect filter comparison types.
 * @readonly
 * @enum {string}
 */
const ComparisonType = Object.freeze({
    IS: "が一致",
    IS_NOT: "が不一致",
    GREATER_THAN: "より大きい",
    GREATER_THAN_OR_EQUAL_TO: "以上",
    LESS_THAN: "未満",
    LESS_THAN_OR_EQUAL_TO: "以下",
    CONTAINS: "厳格に一致",
    DOESNT_CONTAIN: "厳格に不一致",
    DOESNT_STARTS_WITH: "で始まらない",
    STARTS_WITH: "で始まる",
    DOESNT_END_WITH: "で終わらない",
    ENDS_WITH: "で終わる",
    MATCHES_REGEX_CS: "正規表現に一致",
    DOESNT_MATCH_REGEX_CS: "正規表現に不一致",
    MATCHES_REGEX: "正規表現にマッチする",
    DOESNT_MATCH_REGEX: "正規表現にマッチしない"
});

exports.ComparisonType = ComparisonType;