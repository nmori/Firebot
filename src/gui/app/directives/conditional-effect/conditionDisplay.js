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
                        style="margin-left:5px"
                        uib-tooltip="{{$ctrl.rightSideValueDisplay}}" 
                        tooltip-append-to-body="true">
                            {{$ctrl.rightSideValueDisplay}}
                    </span>
                    <b 
                        class="condition-side" 
                        style="min-width: 12px;"
                        uib-tooltip="{{$ctrl.condition.comparisonType}}" 
                        tooltip-append-to-body="true">
                            {{$ctrl.condition.comparisonType}}
                    </b>

                </span>
            `,
            controller: function($injector, $q) {
                const $ctrl = this;

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
<<<<<<< HEAD
                    return $q(async resolve => {
                        if ($ctrl.condition == null || $ctrl.condition.rightSideValue == null) {
=======
                    return $q(async (resolve) => {
                        if ($ctrl.condition == null || $ctrl.condition.rightSideValue === null || $ctrl.condition.rightSideValue === undefined || $ctrl.condition.rightSideValue === "") {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
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
<<<<<<< HEAD
                    return $q(async resolve => {
                        if ($ctrl.condition == null || $ctrl.condition.leftSideValue == null) {
=======
                    return $q(async (resolve) => {
                        if ($ctrl.condition == null || $ctrl.condition.leftSideValue === null || $ctrl.condition.leftSideValue === undefined || $ctrl.condition.leftSideValue === "") {
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20
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
                    getRightSideValueDisplay().then(value => {
                        $ctrl.rightSideValueDisplay = value;
                    });
                    getLeftSideValueDisplay().then(value => {
                        $ctrl.leftSideValueDisplay = value;
                    });
                };

                $ctrl.$onChanges = function() {
                    getRightSideValueDisplay().then(value => {
                        $ctrl.rightSideValueDisplay = value;
                    });
                    getLeftSideValueDisplay().then(value => {
                        $ctrl.leftSideValueDisplay = value;
                    });
                };
            }
        });
}());