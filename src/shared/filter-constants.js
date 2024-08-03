"use strict";

/**
 * Enum for effect filter comparison types.
 * @readonly
 * @enum {string}
 */
const ComparisonType = Object.freeze({
    IS: "が一致",
    IS_NOT: "が不一致",
    INCLUDING: "を含む",
    NOT_INCLUDING: "を含まない",
    GREATER_THAN: "より上",
    GREATER_THAN_OR_EQUAL_TO: "以上",
    LESS_THAN: "未満",
    LESS_THAN_OR_EQUAL_TO: "以下",
    CONTAINS: "含んでいる",
    DOESNT_CONTAIN: "アイテムに含む",
    DOES_NOT_CONTAIN: "アイテムに含まない",
    DOESNT_STARTS_WITH: "で始まらない",
    STARTS_WITH: "で始まる",
    DOESNT_END_WITH: "で終わらない",
    ENDS_WITH: "で終わる",
    MATCHES_REGEX_CS: "正規表現に一致",
    DOESNT_MATCH_REGEX_CS: "正規表現に不一致",
    MATCHES_REGEX: "正規表現に一致（大小問わず）",
    DOESNT_MATCH_REGEX: "正規表現に不一致（大小問わず）",
    IS_STRICTKY: "厳密に一致",
    IS_NOT_STRICTKY: "厳密に不一致",
    FOLLOW: "フォロー",
    HAS_ROLE: "役割を担当",
    HAS_NOT_ROLE: "役割を担当していない",

    //COMPAT : 設定ファイル（過去）互換
    COMPAT_IS: "一致",
    COMPAT_IS_NOT: "不一致",
    COMPAT_INCLUDING: "含む",
    COMPAT_NOT_INCLUDING: "含まない",
    COMPAT_GREATER_THAN: "より大きい",
    COMPAT_CONTAINS: "厳格に一致",
    COMPAT_DOESNT_CONTAIN: "厳格に不一致",
    COMPAT_DOESNT_STARTS_WITH: "で始まらない",
    COMPAT_MATCHES_REGEX: "正規表現にマッチする",
    COMPAT_DOESNT_MATCH_REGEX: "正規表現にマッチしない",

    //Original : 設定ファイル互換
    ORG_IS: "is",
    ORG_IS_NOT: "is not",
    ORG_GREATER_THAN: "greater than",
    ORG_GREATER_THAN_OR_EQUAL_TO: "greater than or equal to",
    ORG_LESS_THAN: "less than",
    ORG_LESS_THAN_OR_EQUAL_TO: "less than or equal to",
    ORG_CONTAINS: "contains",
    ORG_DOESNT_CONTAIN: "doesn't contain",
    ORG_DOESNT_STARTS_WITH: "doesn't start with",
    ORG_STARTS_WITH: "starts with",
    ORG_DOESNT_END_WITH: "doesn't end with",
    ORG_ENDS_WITH: "ends with",
    ORG_MATCHES_REGEX_CS: "matches regex",
    ORG_DOESNT_MATCH_REGEX_CS: "doesn't matches regex",
    ORG_MATCHES_REGEX: "matches regex (case insensitive)",
    ORG_DOESNT_MATCH_REGEX: "doesn't match regex (case insensitive)",
    ORG_INCLUDING: "include",
    ORG_NOT_INCLUDING: "doesn't include",
    ORG_HAS_ROLE: "has role",
    ORG_HAS_NOT_ROLE: "doesn't have role"
});

exports.ComparisonType = ComparisonType;