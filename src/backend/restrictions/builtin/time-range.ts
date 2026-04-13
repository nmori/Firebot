/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import moment from "moment";

import type { RestrictionType } from "../../../types/restrictions";

const DAY_ORDER = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const LEGACY_JA_DAY_MAP: Record<string, string> = {
    "日曜日": "Sunday",
    "月曜日": "Monday",
    "火曜日": "Tuesday",
    "水曜日": "Wednesday",
    "木曜日": "Thursday",
    "金曜日": "Friday",
    "土曜日": "Saturday"
};

const DAY_LABEL_MAP: Record<string, string> = {
    Sunday: "日曜日",
    Monday: "月曜日",
    Tuesday: "火曜日",
    Wednesday: "水曜日",
    Thursday: "木曜日",
    Friday: "金曜日",
    Saturday: "土曜日"
};

function normalizeDayLabel(day: string): string {
    return LEGACY_JA_DAY_MAP[day] ?? day;
}

function toJapaneseDayLabel(day: string): string {
    return DAY_LABEL_MAP[normalizeDayLabel(day)] ?? day;
}

const model: RestrictionType<{
    mode: "time" | "days";
    days: string[];
    startTime: string;
    endTime: string;
}> = {
    definition: {
        id: "firebot:timeRange",
        name: "時間 / 曜日",
        description: "特定の現地時間または曜日のみに使用を制限します。",
        triggers: []
    },
    optionsTemplate: `
        <div>
            <div class="modal-subheader" style="padding: 0 0 4px 0">
                モード
            </div>
            <div style="margin-bottom: 10px">
                <label class="control-fb control--radio">時間 <span class="muted"><br />特定の時間帯のみに制限</span>
                    <input type="radio" ng-model="restriction.mode" value="time"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >曜日 <span class="muted"><br />特定の曜日のみに制限</span>
                    <input type="radio" ng-model="restriction.mode" value="days"/>
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div ng-if="restriction.mode === 'time'">
                <div id="startTime" class="modal-subheader" style="padding: 0 0 4px 0">
                    開始時刻
                </div>
                <div uib-timepicker ng-model="restriction.startTime" show-spinners="false"></div>

                <div id="endTime" class="modal-subheader" style="padding: 1em 0 4px 0">
                    終了時刻
                </div>
                <div uib-timepicker ng-model="restriction.endTime" show-spinners="false"></div>
            </div>

            <div ng-if="restriction.mode === 'days'">
                <div id="roles" class="modal-subheader" style="padding: 0 0 4px 0">
                    曜日
                </div>
                <div class="viewer-group-list">
                    <label ng-repeat="day in getAllDays()" class="control-fb control--checkbox">{{day}}
                        <input type="checkbox" ng-click="toggleDay(day)" ng-checked="isDayChecked(day)"  aria-label="..." >
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </div>
        </div>
    `,
    optionsController: ($scope) => {
        if (!$scope.restriction.mode) {
            $scope.restriction.mode = "time";
        }

        if (!$scope.restriction.days) {
            $scope.restriction.days = [];
        }

        $scope.allDays = DAY_ORDER.map(toJapaneseDayLabel);

        $scope.getAllDays = () => {
            return $scope.allDays;
        };

        $scope.isDayChecked = (day: string) => {
            return $scope.restriction.days.includes(normalizeDayLabel(day));
        };

        $scope.toggleDay = (day: string) => {
            const normalizedDay = normalizeDayLabel(day);
            if ($scope.isDayChecked(day)) {
                $scope.restriction.days = $scope.restriction.days.filter(id => id !== normalizedDay);
            } else {
                $scope.restriction.days.push(normalizedDay);
            }
        };
    },
    optionsValueDisplay: (restriction) => {
        function formatAMPM(dateString: string) {
            const date = new Date(dateString);
            let hours = date.getHours();
            let minutes: string | number = date.getMinutes();
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'

            if (isNaN(minutes)) {
                minutes = "00";
            } else {
                minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            }

            if (isNaN(hours)) {
                hours = 12;
            }

            return `${hours}:${minutes} ${ampm}`;
        }

        function daySorter(a: string, b: string) {
            return DAY_ORDER.indexOf(normalizeDayLabel(a)) - DAY_ORDER.indexOf(normalizeDayLabel(b));
        }

        if (restriction.mode === "days") {
            const days = restriction.days;
            let output = "未選択";
            if (days.length > 0) {
                const sortedDays = days.sort(daySorter);
                output = sortedDays.map(toJapaneseDayLabel).join(", ");
            }
            return `曜日（${output}）`;
        } else if (restriction.mode === "time") {
            const startTime = formatAMPM(restriction.startTime);
            const endTime = formatAMPM(restriction.endTime);

            return `${startTime} - ${endTime} の間`;
        }

        return "";
    },
    predicate: async (_, restrictionData) => {
        return new Promise((resolve, reject) => {

            if (restrictionData.mode === "days") {
                const currentDayOfWeek = new Date().toLocaleString('en-us', { weekday: 'long' });
                const restrictionDays = restrictionData.days.map(normalizeDayLabel);
                if (restrictionDays.includes(currentDayOfWeek)) {
                    resolve(true);
                } else {
                    reject(`曜日は ${restrictionDays.map(toJapaneseDayLabel).join(", ")} のいずれかである必要があります。`);
                }

            } else if (restrictionData.mode === "time") {
                const time = moment(),
                    startTime = moment(restrictionData.startTime);
                let endTime = moment(restrictionData.endTime);

                if (endTime.isSameOrBefore(startTime)) {
                    endTime = endTime.add(1, 'days');
                }

                if (time.isBetween(startTime, endTime)) {
                    resolve(true);
                } else {
                    reject(`${moment(restrictionData.startTime).format('hh:mm A')} から ${moment(restrictionData.endTime).format('hh:mm A')} の間である必要があります。`);
                }
            }
        });
    }
};

export = model;