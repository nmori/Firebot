"use strict";

/**
 * Enum for event filter comparison types.
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

/**
 * Enum for conditional effect condition comparison types.
 *
 * NOTE: conditions use their own vocabulary ("is greater than") which is NOT
 * interchangeable with the event filter one ("greater than"). Mixing the two
 * makes predicates fall through to their `default` case and silently return
 * false, so keep the two sets - and their legacy maps below - separate.
 * @readonly
 * @enum {string}
 */
const ConditionComparisonType = Object.freeze({
    IS: "is",
    IS_NOT: "is not",
    IS_STRICTLY: "is strictly",
    IS_NOT_STRICTLY: "is not strictly",
    LESS_THAN: "is less than",
    LESS_THAN_OR_EQUAL_TO: "is less than or equal to",
    GREATER_THAN: "is greater than",
    GREATER_THAN_OR_EQUAL_TO: "is greater than or equal to",
    CONTAINS: "contains",
    DOESNT_CONTAIN: "does not contain",
    CONTAINS_CI: "contains (case-insensitive)",
    DOESNT_CONTAIN_CI: "does not contain (case-insensitive)",
    MATCHES_REGEX: "matches regex",
    DOESNT_MATCH_REGEX: "does not match regex",
    HAS_ROLE: "has role",
    DOESNT_HAVE_ROLE: "doesn't have role",
    FOLLOWS: "follows"
});

// Japanese labels saved by prior JP builds, normalized to current event filter values.
const LegacyFilterComparisonTypeMap = Object.freeze({
    "が一致": ComparisonType.IS,
    "一致": ComparisonType.IS,
    "と一致": ComparisonType.IS,
    "等しい": ComparisonType.IS,
    "が不一致": ComparisonType.IS_NOT,
    "不一致": ComparisonType.IS_NOT,
    "と不一致": ComparisonType.IS_NOT,
    "等しくない": ComparisonType.IS_NOT,
    "厳密に一致": ComparisonType.IS,
    "厳密に不一致": ComparisonType.IS_NOT,
    "より上": ComparisonType.GREATER_THAN,
    "より大きい": ComparisonType.GREATER_THAN,
    "以上": ComparisonType.GREATER_THAN_OR_EQUAL_TO,
    "未満": ComparisonType.LESS_THAN,
    "より小さい": ComparisonType.LESS_THAN,
    "以下": ComparisonType.LESS_THAN_OR_EQUAL_TO,
    "厳格に一致": ComparisonType.CONTAINS,
    "厳格に不一致": ComparisonType.DOESNT_CONTAIN,
    "含んでいる": ComparisonType.CONTAINS,
    "含む": ComparisonType.CONTAINS,
    "を配列に含む": ComparisonType.CONTAINS,
    "アイテムに含まない": ComparisonType.DOESNT_CONTAIN,
    "アイテムに含む": ComparisonType.DOESNT_CONTAIN,
    "含まない": ComparisonType.DOESNT_CONTAIN,
    "を配列に含まない": ComparisonType.DOESNT_CONTAIN,
    "で始まる": ComparisonType.STARTS_WITH,
    "で始まらない": ComparisonType.DOESNT_STARTS_WITH,
    "で終わる": ComparisonType.ENDS_WITH,
    "で終わらない": ComparisonType.DOESNT_END_WITH,
    "正規表現に一致": ComparisonType.MATCHES_REGEX_CS,
    "という正規表現に一致": ComparisonType.MATCHES_REGEX_CS,
    "正規表現に不一致": ComparisonType.DOESNT_MATCH_REGEX_CS,
    "という正規表現に不一致": ComparisonType.DOESNT_MATCH_REGEX_CS,
    "正規表現に一致しない": ComparisonType.DOESNT_MATCH_REGEX_CS,
    "正規表現に一致（大小問わず）": ComparisonType.MATCHES_REGEX,
    "という正規表現に一致（大小問わず）": ComparisonType.MATCHES_REGEX,
    "正規表現に一致（大小無視）": ComparisonType.MATCHES_REGEX,
    "正規表現にマッチする": ComparisonType.MATCHES_REGEX,
    "正規表現に不一致（大小問わず）": ComparisonType.DOESNT_MATCH_REGEX,
    "という正規表現に不一致（大小問わず）": ComparisonType.DOESNT_MATCH_REGEX,
    "正規表現に不一致（大小無視）": ComparisonType.DOESNT_MATCH_REGEX,
    "正規表現にマッチしない": ComparisonType.DOESNT_MATCH_REGEX
});

// Japanese labels saved by prior JP builds, normalized to current condition values.
//
// NOTE: "含む"/"含まない" are ambiguous - generic conditions mean "contains" while
// the viewer roles condition means "has role". They are mapped to "contains" here and
// the viewer roles condition maps them on to its own vocabulary in its predicate.
const LegacyConditionComparisonTypeMap = Object.freeze({
    "が一致": ConditionComparisonType.IS,
    "一致": ConditionComparisonType.IS,
    "と一致": ConditionComparisonType.IS,
    "等しい": ConditionComparisonType.IS,
    "が不一致": ConditionComparisonType.IS_NOT,
    "不一致": ConditionComparisonType.IS_NOT,
    "と不一致": ConditionComparisonType.IS_NOT,
    "等しくない": ConditionComparisonType.IS_NOT,
    "厳格に一致": ConditionComparisonType.IS_STRICTLY,
    "厳密に一致": ConditionComparisonType.IS_STRICTLY,
    "厳格に不一致": ConditionComparisonType.IS_NOT_STRICTLY,
    "厳密に不一致": ConditionComparisonType.IS_NOT_STRICTLY,
    "より上": ConditionComparisonType.GREATER_THAN,
    "より大きい": ConditionComparisonType.GREATER_THAN,
    "以上": ConditionComparisonType.GREATER_THAN_OR_EQUAL_TO,
    "未満": ConditionComparisonType.LESS_THAN,
    "より小さい": ConditionComparisonType.LESS_THAN,
    "以下": ConditionComparisonType.LESS_THAN_OR_EQUAL_TO,
    "含んでいる": ConditionComparisonType.CONTAINS,
    "含む": ConditionComparisonType.CONTAINS,
    "を配列に含む": ConditionComparisonType.CONTAINS,
    "アイテムに含まない": ConditionComparisonType.DOESNT_CONTAIN,
    "含まない": ConditionComparisonType.DOESNT_CONTAIN,
    "を配列に含まない": ConditionComparisonType.DOESNT_CONTAIN,
    "含む（大文字小文字を区別しない）": ConditionComparisonType.CONTAINS_CI,
    "含む（大小無視）": ConditionComparisonType.CONTAINS_CI,
    "含む（大小問わず）": ConditionComparisonType.CONTAINS_CI,
    "含まない（大文字小文字を区別しない）": ConditionComparisonType.DOESNT_CONTAIN_CI,
    "含まない（大小無視）": ConditionComparisonType.DOESNT_CONTAIN_CI,
    "含まない（大小問わず）": ConditionComparisonType.DOESNT_CONTAIN_CI,
    "正規表現": ConditionComparisonType.MATCHES_REGEX,
    "正規表現で一致": ConditionComparisonType.MATCHES_REGEX,
    "正規表現に一致": ConditionComparisonType.MATCHES_REGEX,
    "という正規表現に一致": ConditionComparisonType.MATCHES_REGEX,
    "正規表現に一致（大小問わず）": ConditionComparisonType.MATCHES_REGEX,
    "正規表現に一致（大小無視）": ConditionComparisonType.MATCHES_REGEX,
    "正規表現にマッチする": ConditionComparisonType.MATCHES_REGEX,
    "正規表現で不一致": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "正規表現に一致しない": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "正規表現に不一致": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "という正規表現に不一致": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "正規表現に不一致（大小問わず）": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "正規表現に不一致（大小無視）": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "正規表現にマッチしない": ConditionComparisonType.DOESNT_MATCH_REGEX,
    "役割を担当": ConditionComparisonType.HAS_ROLE,
    "に属している": ConditionComparisonType.HAS_ROLE,
    "ロールを持つ": ConditionComparisonType.HAS_ROLE,
    "役割を担当していない": ConditionComparisonType.DOESNT_HAVE_ROLE,
    "に属していない": ConditionComparisonType.DOESNT_HAVE_ROLE,
    "ロールを持たない": ConditionComparisonType.DOESNT_HAVE_ROLE,
    "フォロー": ConditionComparisonType.FOLLOWS,
    "フォローしている": ConditionComparisonType.FOLLOWS
});

exports.ComparisonType = ComparisonType;
exports.ConditionComparisonType = ConditionComparisonType;
exports.LegacyFilterComparisonTypeMap = LegacyFilterComparisonTypeMap;
exports.LegacyConditionComparisonTypeMap = LegacyConditionComparisonTypeMap;
