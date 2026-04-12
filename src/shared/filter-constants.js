"use strict";

/**
 * Enum for effect filter comparison types.
 * @readonly
 * @enum {string}
 */
const ComparisonType = Object.freeze({
    IS: "is",
    IS_NOT: "is not",
    GREATER_THAN: "greater than",
    GREATER_THAN_OR_EQUAL_TO: "greater than or equal to",
    LESS_THAN: "less than",
    LESS_THAN_OR_EQUAL_TO: "less than or equal to",
    CONTAINS: "contains",
    DOESNT_CONTAIN: "doesn't contain",
    DOESNT_STARTS_WITH: "doesn't start with",
    STARTS_WITH: "starts with",
    DOESNT_END_WITH: "doesn't end with",
    ENDS_WITH: "ends with",
    MATCHES_REGEX_CS: "matches regex",
    DOESNT_MATCH_REGEX_CS: "doesn't matches regex",
    MATCHES_REGEX: "matches regex (case insensitive)",
    DOESNT_MATCH_REGEX: "doesn't match regex (case insensitive)"
});

// Legacy labels used by prior JP builds are normalized to current comparison values.
const LegacyComparisonTypeMap = Object.freeze({
    "が一致": ComparisonType.IS,
    "一致": ComparisonType.IS,
    "と一致": ComparisonType.IS,
    "が不一致": ComparisonType.IS_NOT,
    "不一致": ComparisonType.IS_NOT,
    "と不一致": ComparisonType.IS_NOT,
    "より上": ComparisonType.GREATER_THAN,
    "より大きい": ComparisonType.GREATER_THAN,
    "以上": ComparisonType.GREATER_THAN_OR_EQUAL_TO,
    "未満": ComparisonType.LESS_THAN,
    "以下": ComparisonType.LESS_THAN_OR_EQUAL_TO,
    "含んでいる": ComparisonType.CONTAINS,
    "含む": ComparisonType.CONTAINS,
    "を配列に含む": ComparisonType.CONTAINS,
    "厳格に一致": ComparisonType.CONTAINS,
    "アイテムに含まない": ComparisonType.DOESNT_CONTAIN,
    "含まない": ComparisonType.DOESNT_CONTAIN,
    "を配列に含まない": ComparisonType.DOESNT_CONTAIN,
    "厳格に不一致": ComparisonType.DOESNT_CONTAIN,
    "で始まる": ComparisonType.STARTS_WITH,
    "で始まらない": ComparisonType.DOESNT_STARTS_WITH,
    "で終わる": ComparisonType.ENDS_WITH,
    "で終わらない": ComparisonType.DOESNT_END_WITH,
    "正規表現に一致": ComparisonType.MATCHES_REGEX_CS,
    "という正規表現に一致": ComparisonType.MATCHES_REGEX_CS,
    "正規表現に不一致": ComparisonType.DOESNT_MATCH_REGEX_CS,
    "という正規表現に不一致": ComparisonType.DOESNT_MATCH_REGEX_CS,
    "正規表現に一致（大小問わず）": ComparisonType.MATCHES_REGEX,
    "という正規表現に一致（大小問わず）": ComparisonType.MATCHES_REGEX,
    "正規表現に不一致（大小問わず）": ComparisonType.DOESNT_MATCH_REGEX,
    "という正規表現に不一致（大小問わず）": ComparisonType.DOESNT_MATCH_REGEX,
    "正規表現にマッチする": ComparisonType.MATCHES_REGEX,
    "正規表現にマッチしない": ComparisonType.DOESNT_MATCH_REGEX
});

exports.ComparisonType = ComparisonType;
exports.LegacyComparisonTypeMap = LegacyComparisonTypeMap;