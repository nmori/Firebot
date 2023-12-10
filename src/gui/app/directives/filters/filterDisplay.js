"use strict";
(function() {
    angular.module("firebotApp")
        .component("filterDisplay", {
            bindings: {
                filter: "<",
                filterType: "<"
            },
            template: `
                <span style="display: flex;justify-content: space-between;align-items: center;">
                    <b class="condition-side" style="margin-right:5px">{{$ctrl.getFilterName()}}</b> {{$ctrl.filter.comparisonType}} <b class="condition-side" style="margin-left:5px">{{$ctrl.filterValueDisplay}}</b>
                </span>
            `,
            controller: function($injector, $q) {
                const $ctrl = this;

                $ctrl.getFilterName = function() {
                    return $ctrl.filterType ? $ctrl.filterType.name : "不明";
                };

                $ctrl.filterValueDisplay = "[未設定]";

                function getFilterValueDisplay() {
                    return $q(async resolve => {
                        if ($ctrl.filter == null || $ctrl.filter.value == null) {
                            resolve("[未設定]");
                        } else {
                            const value = await $injector.invoke($ctrl.filterType.getSelectedValueDisplay, {}, {
                                filterSettings: $ctrl.filter
                            });
                            resolve(value);
                        }
                    });


                }

                $ctrl.$onInit = function() {
                    getFilterValueDisplay().then(value => {
                        $ctrl.filterValueDisplay = value;
                    });
                };

                $ctrl.$onChanges = function() {

                    getFilterValueDisplay().then(value => {
                        $ctrl.filterValueDisplay = value;
                    });
                };
            }
        });
}());