"use strict";
(function () {
    angular.module("firebotApp")
        .component("filterDisplay", {
            bindings: {
                filter: "<",
                filterType: "<"
            },
            template: `
                <span style="display: flex;justify-content: space-between;align-items: center;">
                    <b class="condition-side" style="margin-right:5px">{{$ctrl.getFilterName()}}</b> {{$ctrl.getComparisonTypeLabel($ctrl.filter.comparisonType)}} <b class="condition-side" style="margin-left:5px">{{$ctrl.filterValueDisplay}}</b>
                </span>
            `,
            controller: function ($injector, $q) {
                const $ctrl = this;

                const comparisonTypeLabels = {
                    "is": "一致",
                    "is not": "不一致",
                    "is strictly": "厳格に一致",
                    "is not strictly": "厳格に不一致",
                    "is less than": "未満",
                    "is less than or equal to": "以下",
                    "is greater than": "より大きい",
                    "is greater than or equal to": "以上",
                    "contains": "含む",
                    "doesn't contain": "含まない",
                    "does not contain": "含まない",
                    "starts with": "で始まる",
                    "doesn't start with": "で始まらない",
                    "ends with": "で終わる",
                    "doesn't end with": "で終わらない",
                    "matches regex": "正規表現に一致",
                    "doesn't matches regex": "正規表現に不一致",
                    "matches regex (case insensitive)": "正規表現に一致（大小無視）",
                    "doesn't match regex (case insensitive)": "正規表現に不一致（大小無視）",
                    "follows": "フォローしている",
                    "has role": "ロールを持つ",
                    "doesn't have role": "ロールを持たない"
                };

                $ctrl.getFilterName = function () {
                    return $ctrl.filterType ? $ctrl.filterType.name : "不明";
                };

                $ctrl.getComparisonTypeLabel = function(comparisonType) {
                    return comparisonTypeLabels[comparisonType] || comparisonType;
                };

                $ctrl.filterValueDisplay = "[未設定]";

                function getFilterValueDisplay() {
                    return $q(async (resolve) => {
                        if ($ctrl.filter == null || $ctrl.filter.value == null) {
                            resolve("[未設定]");
                        } else {
                            const value = await $injector.invoke($ctrl.filterType.getSelectedValueDisplay, {}, {
                                filterSettings: $ctrl.filter,
                                filterType: $ctrl.filterType,
                                presetValues: await $injector.invoke($ctrl.filterType.getPresetValues, {}, {})
                            });
                            resolve(value);
                        }
                    });


                }

                $ctrl.$onInit = function () {
                    getFilterValueDisplay().then((value) => {
                        $ctrl.filterValueDisplay = value;
                    });
                };

                $ctrl.$onChanges = function () {

                    getFilterValueDisplay().then((value) => {
                        $ctrl.filterValueDisplay = value;
                    });
                };
            }
        });
}());