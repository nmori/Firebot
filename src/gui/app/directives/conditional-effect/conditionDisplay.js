"use strict";
(function() {
    angular.module("firebotApp")
        .component("conditionDisplay", {
            bindings: {
                condition: "<",
                conditionType: "<"
            },
            template: `
                <span style="display: flex;justify-content: space-between;align-items: center;">
                    <b 
                        class="condition-side" 
                        style="margin-right:5px" 
                        uib-tooltip="{{$ctrl.getConditionName()}}" 
                        tooltip-append-to-body="true">
                            {{$ctrl.getConditionName()}}
                    </b>
                    <span 
                        class="condition-side" 
                        style="min-width: 12px;"
                        uib-tooltip="{{$ctrl.getComparisonTypeLabel($ctrl.condition.comparisonType)}}" 
                        tooltip-append-to-body="true">
                            {{$ctrl.getComparisonTypeLabel($ctrl.condition.comparisonType)}}
                    </span>
                    <b 
                        class="condition-side" 
                        style="margin-left:5px"
                        uib-tooltip="{{$ctrl.rightSideValueDisplay}}" 
                        tooltip-append-to-body="true">
                            {{$ctrl.rightSideValueDisplay}}
                    </b>
                </span>
            `,
            controller: function($injector, $q) {
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
                    "does not contain": "含まない",
                    "contains (case-insensitive)": "含む（大小無視）",
                    "does not contain (case-insensitive)": "含まない（大小無視）",
                    "matches regex": "正規表現に一致",
                    "does not match regex": "正規表現に不一致",
                    "matches regex (case insensitive)": "正規表現に一致（大小無視）",
                    "doesn't match regex (case insensitive)": "正規表現に不一致（大小無視）",
                    "doesn't matches regex": "正規表現に不一致",
                    "has role": "ロールを持つ",
                    "doesn't have role": "ロールを持たない",
                    "include": "ロールを持つ",
                    "is in role": "ロールを持つ",
                    "doesn't include": "ロールを持たない",
                    "isn't in role": "ロールを持たない",
                    "follows": "フォローしている",
                    "starts with": "で始まる",
                    "doesn't start with": "で始まらない",
                    "ends with": "で終わる",
                    "doesn't end with": "で終わらない"
                };

                $ctrl.getComparisonTypeLabel = function(comparisonType) {
                    return comparisonTypeLabels[comparisonType] || comparisonType;
                };

                $ctrl.getConditionName = function() {
                    if ($ctrl.conditionType != null && $ctrl.conditionType.leftSideValueType != null &&
                        $ctrl.conditionType.leftSideValueType !== 'none') {
                        return $ctrl.leftSideValueDisplay;
                    }
                    return $ctrl.conditionType ? $ctrl.conditionType.name : "不明";
                };

                $ctrl.rightSideValueDisplay = "[未設定]";
                $ctrl.leftSideValueDisplay = "[未設定]";

                function getRightSideValueDisplay() {
                    return $q(async (resolve) => {
                        if ($ctrl.condition == null || $ctrl.condition.rightSideValue === null || $ctrl.condition.rightSideValue === undefined || $ctrl.condition.rightSideValue === "") {
                            resolve("[未設定]");
                        } else {
                            const value = await $injector.invoke($ctrl.conditionType.getRightSideValueDisplay, {}, {
                                condition: $ctrl.condition
                            });
                            resolve(value);
                        }
                    });
                }

                function getLeftSideValueDisplay() {
                    return $q(async (resolve) => {
                        if ($ctrl.condition == null || $ctrl.condition.leftSideValue === null || $ctrl.condition.leftSideValue === undefined || $ctrl.condition.leftSideValue === "") {
                            resolve("[未設定]");
                        } else {
                            const value = await $injector.invoke($ctrl.conditionType.getLeftSideValueDisplay, {}, {
                                condition: $ctrl.condition
                            });
                            resolve(value);
                        }
                    });
                }

                $ctrl.$onInit = function() {
                    getRightSideValueDisplay().then((value) => {
                        $ctrl.rightSideValueDisplay = value !== null && value !== undefined ? value : "[未設定]";
                    });
                    getLeftSideValueDisplay().then((value) => {
                        $ctrl.leftSideValueDisplay = value !== null && value !== undefined ? value : "[未設定]";
                    });
                };

                $ctrl.$onChanges = function() {
                    getRightSideValueDisplay().then((value) => {
                        $ctrl.rightSideValueDisplay = value !== null && value !== undefined ? value : "[未設定]";
                    });
                    getLeftSideValueDisplay().then((value) => {
                        $ctrl.leftSideValueDisplay = value !== null && value !== undefined ? value : "[未設定]";
                    });
                };
            }
        });
}());