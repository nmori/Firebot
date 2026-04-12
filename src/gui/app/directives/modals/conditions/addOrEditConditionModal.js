"use strict";

// Modal for adding or editing a condition

(function() {
    angular.module("firebotApp")
        .component("addOrEditConditionModal", {
            template:
        `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">{{$ctrl.isNewCondition ? '新しい条件を作成' : '条件を編集'}}</h4>
            </div>
            <div class="modal-body">

                <div style="display: flex;flex-direction: column;">
                    <div class="modal-subheader muted" style="padding: 0 0 4px 0;">
                        タイプ
                    </div>
                    <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{$ctrl.getConditionName($ctrl.selectedCondition.type)}}<span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="condition in $ctrl.availableConditions" ng-click="$ctrl.selectCondition(condition.id)">
                                <a href>{{condition.name}} <tooltip text="condition.description"></tooltip></a>
                            </li>
                        </ul>
                    </div>

                    <div ng-if="$ctrl.currentConditionDef.leftSideValueType != null && $ctrl.currentConditionDef.leftSideValueType != 'none'" ng-switch="$ctrl.currentConditionDef.leftSideValueType" style="flex: 1 1 0;margin-right: 5px;">
                        <div ng-switch-when="preset">
                            <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                                <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                                    {{$ctrl.getSelectedLeftSidePresetValueDisplay()}} <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                                    <li role="menuitem" ng-repeat="preset in $ctrl.rightSidePresetValues" ng-click="$ctrl.selectedCondition.leftSideValue = preset.value">
                                        <a href>{{preset.display}}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div ng-switch-default>
                            <textarea type="{{$ctrl.currentConditionDef.leftSideValueType}}" class="form-control" style="min-width: 310px;" ng-model="$ctrl.selectedCondition.leftSideValue" placeholder="{{$ctrl.currentConditionDef.leftSideTextPlaceholder}}" menu-position="under" replace-variables disable-variable-menu="$ctrl.currentConditionDef.leftSideValueType !== 'text'"></textarea>
                        </div>
                    </div>

                    <div class="modal-subheader muted" style="padding: 0 0 4px 0; margin-top: 12px;">
                        比較
                    </div>
                    <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{$ctrl.getComparisonTypeLabel($ctrl.selectedCondition.comparisonType)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="comparisonType in $ctrl.currentConditionDef.comparisonTypes" ng-click="$ctrl.selectedCondition.comparisonType = comparisonType">
                                <a href>{{$ctrl.getComparisonTypeLabel(comparisonType)}}</a>
                            </li>
                        </ul>
                    </div>

                    <div class="modal-subheader muted" style="padding: 0 0 4px 0; margin-top: 12px;">
                        期待値
                    </div>
                    <div ng-switch="$ctrl.currentConditionDef.rightSideValueType" style="flex: 1 1 0;">
                        <div ng-switch-when="preset">

                            <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                                <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                                    {{$ctrl.getSelectedRightSidePresetValueDisplay()}} <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                                    <li role="menuitem" ng-repeat="preset in $ctrl.rightSidePresetValues" ng-click="$ctrl.selectedCondition.rightSideValue = preset.value">
                                        <a href>{{preset.display}}</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div ng-switch-default>
                            <textarea type="{{$ctrl.currentConditionDef.rightSideValueType}}" class="form-control" style="min-width: 100px;" ng-model="$ctrl.selectedCondition.rightSideValue" placeholder="{{$ctrl.currentConditionDef.rightSideTextPlaceholder}}" menu-position="under" replace-variables disable-variable-menu="$ctrl.currentConditionDef.rightSideValueType !== 'text'"></textarea>
                        </div>
                    </div>
                </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger pull-left" ng-click="$ctrl.delete()" ng-hide="$ctrl.isNewCondition">削除</button>
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
            </div>
        `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&",
                modalInstance: "<"
            },
            controller: function($injector, $scope) {
                const $ctrl = this;

                $ctrl.availableConditions = [];

                $ctrl.currentConditionDef = {};

                $ctrl.selectedCondition = {};

                $ctrl.rightSidePresetValues = [];
                $ctrl.leftSidePresetValues = [];

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

                async function loadPresetValues() {
                    if ($ctrl.currentConditionDef && $ctrl.currentConditionDef.rightSideValueType === "preset") {
                        const rightSidePresetValues = await $injector.invoke($ctrl.currentConditionDef.getRightSidePresetValues, {}, {});
                        if (rightSidePresetValues != null && Array.isArray(rightSidePresetValues)) {
                            $ctrl.rightSidePresetValues = rightSidePresetValues;
                        }
                    }

                    if ($ctrl.currentConditionDef && $ctrl.currentConditionDef.leftSideValueType === "preset") {
                        const leftSidePresetValues = await $injector.invoke($ctrl.currentConditionDef.getLeftSidePresetValues, {}, {});
                        if (leftSidePresetValues != null && Array.isArray(leftSidePresetValues)) {
                            $ctrl.leftSidePresetValues = leftSidePresetValues;
                        }
                    }
                }

                $ctrl.getSelectedRightSidePresetValueDisplay = function() {
                    if ($ctrl.rightSidePresetValues.length > 0 && $ctrl.selectedCondition && $ctrl.selectedCondition.rightSideValue) {

                        const presetValue = $ctrl.rightSidePresetValues.find(pv => pv.value === $ctrl.selectedCondition.rightSideValue);

                        if (presetValue) {
                            return presetValue.display;
                        }
                    }
                    return "1つ選択";
                };

                $ctrl.getSelectedLeftSidePresetValueDisplay = function() {
                    if ($ctrl.leftSidePresetValues.length > 0 && $ctrl.selectedCondition && $ctrl.selectedCondition.leftSideValue) {

                        const presetValue = $ctrl.leftSidePresetValues.find(pv => pv.value === $ctrl.selectedCondition.leftSideValue);

                        if (presetValue) {
                            return presetValue.display;
                        }
                    }
                    return "1つ選択";
                };

                $ctrl.getComparisonTypeLabel = function(comparisonType) {
                    return comparisonTypeLabels[comparisonType] || comparisonType;
                };


                $ctrl.selectCondition = function(conditionId) {
                    $ctrl.selectedCondition.type = conditionId;
                    $ctrl.selectedCondition.value = null;

                    $ctrl.currentConditionDef = $ctrl.availableConditions.find(f => f.id === conditionId);
                    if ($ctrl.currentConditionDef) {
                        $ctrl.selectedCondition.comparisonType = $ctrl.currentConditionDef.comparisonTypes[0];
                        loadPresetValues();
                    }
                };

                $ctrl.getConditionName = function(conditionId) {
                    const conditionDef = $ctrl.availableConditions.find(f => f.id === conditionId);
                    return conditionDef ? conditionDef.name : conditionId;
                };

                $ctrl.$onInit = function() {

                    $scope.trigger = $ctrl.resolve.trigger;
                    $scope.triggerMeta = $ctrl.resolve.triggerMeta;

                    if ($ctrl.resolve.availableConditions) {
                        $ctrl.availableConditions = $ctrl.resolve.availableConditions;
                    }
                    if ($ctrl.resolve.condition == null) {

                        $ctrl.isNewCondition = true;

                        if ($ctrl.availableConditions.length > 0) {
                            const firstConditionDef = $ctrl.availableConditions[0];
                            $ctrl.selectedCondition.type = firstConditionDef.id;
                            $ctrl.selectedCondition.comparisonType = firstConditionDef.comparisonTypes[0];
                            $ctrl.currentConditionDef = firstConditionDef;
                            loadPresetValues();
                        }

                    } else {
                        $ctrl.selectedCondition = JSON.parse(JSON.stringify($ctrl.resolve.condition));
                        $ctrl.currentConditionDef = $ctrl.availableConditions.find(f => f.id === $ctrl.selectedCondition.type);
                        loadPresetValues();
                    }
                };

                $ctrl.delete = function() {
                    if ($ctrl.condition) {
                        return;
                    }

                    $ctrl.close({
                        $value: { condition: $ctrl.selectedCondition, index: $ctrl.resolve.index, action: "delete" }
                    });
                };

                $ctrl.save = function() {
                    $ctrl.close({
                        $value: {
                            condition: $ctrl.selectedCondition,
                            index: $ctrl.resolve.index,
                            action: $ctrl.isNewCondition ? "add" : "update"
                        }
                    });
                };
            }
        });
}());
