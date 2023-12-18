"use strict";

/**
 * Enum for effect filter comparison types.
 * @readonly
 * @enum {string}
 */
const ComparisonType = Object.freeze({
    IS: "と一致",
    IS_NOT: "と不一致",
    INCLUDING: "を含む",
    GREATER_THAN: "より大きい",
    GREATER_THAN_OR_EQUAL_TO: "以上",
    LESS_THAN: "未満",
    LESS_THAN_OR_EQUAL_TO: "以下",
    CONTAINS: "を配列に含む",
    DOESNT_CONTAIN: "を配列に含まない",
    DOESNT_STARTS_WITH: "で始まらない",
    STARTS_WITH: "で始まる",
    DOESNT_END_WITH: "で終わらない",
    ENDS_WITH: "で終わる",
    MATCHES_REGEX_CS: "という正規表現に一致",
    DOESNT_MATCH_REGEX_CS: "という正規表現に不一致",
    MATCHES_REGEX: "という正規表現に一致（大小問わず）",
    DOESNT_MATCH_REGEX: "という正規表現に不一致（大小問わず）"
});

exports.ComparisonType = ComparisonType;