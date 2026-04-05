"use strict";

// Modal for adding or editting a filter

(function() {
    angular.module("firebotApp").component("addOrEditFilterModal", {
        template:
        `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">{{$ctrl.isNewFilter ? '新しいフィルタを作成' : 'フィルタを編集'}}</h4>
            </div>
            <div class="modal-body">

                <div style="display: flex;flex-wrap: wrap;">
                    <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{$ctrl.getFilterName($ctrl.selectedFilter.type)}}<span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="filter in $ctrl.availableFilters" ng-click="$ctrl.selectFilter(filter.id)">
                                <a href>{{filter.name}} <tooltip text="filter.description"></tooltip></a>
                            </li>
                        </ul>
                    </div>

                    <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                        {{$ctrl.getComparisonTypeLabel($ctrl.selectedFilter.comparisonType)}} <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-repeat="comparisonType in $ctrl.currentFilterDef.comparisonTypes" ng-click="$ctrl.selectedFilter.comparisonType = comparisonType">
                                <a href>{{$ctrl.getComparisonTypeLabel(comparisonType)}}</a>
                            </li>
                        </ul>
                    </div>

                    <div ng-switch="$ctrl.currentFilterDef.valueType" style="flex: 1 1 0;">
                        <div ng-switch-when="preset">

                            <div class="btn-group" style="margin-right: 5px;margin-bottom:5px;" uib-dropdown>
                                <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle>
                                    {{$ctrl.getSelectedPresetValueDisplay()}} <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                                    <li role="menuitem" ng-repeat="preset in $ctrl.presetValues" ng-click="$ctrl.selectedFilter.value = preset.value">
                                        <a href>{{preset.display}}</a>
                                    </li>
                                </ul>
                            </div>

                        </div>
                        <div ng-switch-default>
                            <input type="{{$ctrl.currentFilterDef.valueType}}" class="form-control" style="min-width: 100px;" ng-model="$ctrl.selectedFilter.value" placeholder="値">
                        </div>
                    </div>
                </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger pull-left" ng-click="$ctrl.delete()" ng-hide="$ctrl.isNewFilter">削除</button>
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
        controller: function($injector) {
            const $ctrl = this;

            $ctrl.availableFilters = [];

            $ctrl.currentFilterDef = {};

            $ctrl.selectedFilter = {};

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

            $ctrl.presetValues = [];
            async function loadPresetValues() {
                if ($ctrl.currentFilterDef && $ctrl.currentFilterDef.valueType === "preset") {
                    const presetValues = await $injector.invoke($ctrl.currentFilterDef.getPresetValues, {}, {});
                    if (presetValues != null && Array.isArray(presetValues)) {
                        $ctrl.presetValues = presetValues;
                    }
                }
            }

            $ctrl.getSelectedPresetValueDisplay = function() {
                if ($ctrl.presetValues.length > 0 && $ctrl.selectedFilter && $ctrl.selectedFilter.value) {

                    const presetValue = $ctrl.presetValues.find(pv => pv.value === $ctrl.selectedFilter.value);

                    if (presetValue) {
                        return presetValue.display;
                    }
                }
                return "1つ選択";
            };

            $ctrl.getComparisonTypeLabel = function(comparisonType) {
                return comparisonTypeLabels[comparisonType] || comparisonType;
            };


            $ctrl.selectFilter = function(filterId) {
                $ctrl.selectedFilter.type = filterId;
                $ctrl.selectedFilter.value = null;

                $ctrl.currentFilterDef = $ctrl.availableFilters.find(f => f.id === filterId);
                if ($ctrl.currentFilterDef) {
                    $ctrl.selectedFilter.comparisonType = $ctrl.currentFilterDef.comparisonTypes[0];
                    loadPresetValues();
                }
            };

            $ctrl.getFilterName = function(filterId) {
                const filterDef = $ctrl.availableFilters.find(f => f.id === filterId);
                return filterDef ? filterDef.name : filterId;
            };

            $ctrl.$onInit = function() {

                if ($ctrl.resolve.availableFilters) {
                    $ctrl.availableFilters = $ctrl.resolve.availableFilters;
                }
                if ($ctrl.resolve.filter == null) {

                    $ctrl.isNewFilter = true;

                    if ($ctrl.availableFilters.length > 0) {
                        const firstFilterDef = $ctrl.availableFilters[0];
                        $ctrl.selectedFilter.type = firstFilterDef.id;
                        $ctrl.selectedFilter.comparisonType = firstFilterDef.comparisonTypes[0];
                        $ctrl.currentFilterDef = firstFilterDef;
                        loadPresetValues();
                    }

                } else {
                    $ctrl.selectedFilter = JSON.parse(JSON.stringify($ctrl.resolve.filter));
                    $ctrl.currentFilterDef = $ctrl.availableFilters.find(f => f.id === $ctrl.selectedFilter.type);
                    loadPresetValues();
                }
            };

            $ctrl.delete = function() {
                if ($ctrl.filter) {
                    return;
                }

                $ctrl.close({
                    $value: { filter: $ctrl.selectedFilter, index: $ctrl.resolve.index, action: "delete" }
                });
            };

            $ctrl.save = function() {
                $ctrl.close({
                    $value: {
                        filter: $ctrl.selectedFilter,
                        index: $ctrl.resolve.index,
                        action: $ctrl.isNewFilter ? "add" : "update"
                    }
                });
            };
        }
    });
}());
