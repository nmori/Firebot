"use strict";

(function() {

    angular
        .module('firebotApp')
        .component("timeInput", {
            bindings: {
                ngModel: "<",
                validationError: "<?",
                large: "<?",
                disabled: "<?",
                maxTimeUnit: "<?",
                minTimeUnit: "<?"
            },
            require: { ngModelCtrl: 'ngModel' },
            template: `
                <div ng-class="{ 'has-error': $ctrl.validationError }">
                    <div class="input-group">
                        <input type="number" ng-disabled="$ctrl.disabled" ng-model="$ctrl.display" ng-change="$ctrl.valueChange()" class="form-control {{$ctrl.large ? 'input-lg' : ''}}" placeholder="数値を入力">
                        <div class="input-group-btn">
                            <button type="button" style="height: 42px;" ng-disabled="$ctrl.disabled" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{$ctrl.selectedTimeUnit}} <span class="caret"></span></button>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li ng-repeat="unit in $ctrl.timeUnits" ng-click="$ctrl.updateTimeScale(unit)"><a href>{{unit}}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `,
            controller: function() {
                const $ctrl = this;

                $ctrl.display = null;

                $ctrl.timeUnits = [
                    "Seconds",
                    "Minutes",
                    "Hours",
                    "Days",
                    "Weeks",
                    "Months",
                    "Years",
                    "秒",
                    "分",
                    "時間",
                    "日",
                    "週",
                    "月",
                    "年"
                ];

                // units of time in secs
                const SECOND = 1;
                const MINUTE = 60;
                const HOUR = 3600;
                const DAY = 86400;
                const WEEK = 7 * DAY;
                const MONTH = 31 * DAY;
                const YEAR = 365 * DAY;

                function getTimeScaleSeconds(unit) {
                    switch (unit) {
                        case "Minutes":
                            return MINUTE;
                        case "Hours":
                            return HOUR;
                        case "Days":
                            return DAY;
                        case "Weeks":
                            return WEEK;
                        case "Months":
                            return MONTH;
                        case "Years":
                            return YEAR;
                        default:
                            return SECOND;
                    }
                }

                function determineTimeUnit(seconds) {
                    if (seconds % YEAR === 0) {
                        return "年";
                    }
                    if (seconds % MONTH === 0) {
                        return "月";
                    }
                    if (seconds % WEEK === 0) {
                        return "週";
                    }
                    if (seconds % DAY === 0) {
                        return "日";
                    }
                    if (seconds % HOUR === 0) {
                        return "時間";
                    }
                    if (seconds % MINUTE === 0) {
                        return "分";
                    }
                    return "秒";
                }

                $ctrl.valueChange = () => {
                    if ($ctrl.display == null) {
                        $ctrl.ngModel = null;
                    } else {

                        const timeScale = getTimeScaleSeconds($ctrl.selectedTimeUnit);

                        $ctrl.ngModel = $ctrl.display * timeScale;
                    }
                    $ctrl.ngModelCtrl.$setViewValue(this.ngModel);

                    $ctrl.ngModelCtrl.$setTouched();
                };

                $ctrl.updateTimeScale = (newUnit) => {
                    $ctrl.selectedTimeUnit = newUnit;
                    $ctrl.valueChange();
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.minTimeUnit != null && $ctrl.timeUnits.includes($ctrl.minTimeUnit)) {
                        $ctrl.timeUnits = $ctrl.timeUnits.slice($ctrl.timeUnits.findIndex(unit => unit === $ctrl.minTimeUnit));
                    }

                    if ($ctrl.maxTimeUnit != null && $ctrl.timeUnits.includes($ctrl.maxTimeUnit)) {
                        $ctrl.timeUnits.length = $ctrl.timeUnits.findIndex(unit => unit === $ctrl.maxTimeUnit) + 1;
                    }

                    $ctrl.selectedTimeUnit = $ctrl.timeUnits[0];

                    if ($ctrl.ngModel != null) {
                        $ctrl.selectedTimeUnit = determineTimeUnit($ctrl.ngModel);

                        const timeScale = getTimeScaleSeconds($ctrl.selectedTimeUnit);

                        $ctrl.display = $ctrl.ngModel / timeScale;
                    }
                };
            }
        });
}());
