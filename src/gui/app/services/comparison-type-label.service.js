"use strict";

(function() {

    // Conditions and event filters both store their comparison type as an English
    // canonical string (see src/shared/filter-constants.js). This service holds the
    // single Japanese label dictionary used to display them.
    angular
        .module("firebotApp")
        .factory("comparisonTypeLabelService", function() {
            const service = {};

            const comparisonTypeLabels = {
                // conditions
                "is": "一致",
                "is not": "不一致",
                "is strictly": "厳格に一致",
                "is not strictly": "厳格に不一致",
                "is less than": "より小さい",
                "is less than or equal to": "以下",
                "is greater than": "より大きい",
                "is greater than or equal to": "以上",
                "contains (case-insensitive)": "含む（大小無視）",
                "does not contain (case-insensitive)": "含まない（大小無視）",
                "does not contain": "含まない",
                "does not match regex": "正規表現に不一致",
                "has role": "ロールを持つ",
                "doesn't have role": "ロールを持たない",
                "follows": "フォローしている",

                // event filters
                "greater than": "より大きい",
                "greater than or equal to": "以上",
                "less than": "未満",
                "less than or equal to": "以下",
                "doesn't contain": "含まない",
                "doesn't matches regex": "正規表現に不一致",
                "matches regex (case insensitive)": "正規表現に一致（大小無視）",
                "doesn't match regex (case insensitive)": "正規表現に不一致（大小無視）",
                "include": "ロールを持つ",
                "doesn't include": "ロールを持たない",

                // shared
                "contains": "含む",
                "matches regex": "正規表現に一致",
                "starts with": "で始まる",
                "doesn't start with": "で始まらない",
                "ends with": "で終わる",
                "doesn't end with": "で終わらない",

                // legacy values that may still be sitting in saved data
                "is in role": "ロールを持つ",
                "isn't in role": "ロールを持たない"
            };

            service.getComparisonTypeLabel = function(comparisonType) {
                return comparisonTypeLabels[comparisonType] || comparisonType;
            };

            return service;
        });
}());
