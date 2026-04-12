"use strict";

(function() {

    const moment = require("moment");

    angular.module("firebotApp")
        .component("adBreakIndicator", {
            bindings: {},
            template: `
                <div
                    class="stream-info-stat hype-train-indicator"
                    style="margin-left:10px"
                    uib-tooltip="予定された広告休憩"
                    tooltip-append-to-body="true"
                    tooltip-placement="bottom"
                >
                    <i class="fas fa-ad" style="margin-right: 5px; font-size: 12px;" />
                    <span class="level-pill">{{abs.adRunning ? '残り' : '開始まで'}}</span>
                    <span class="pl-2 font-bold">{{timeLeftDisplay}}</span>
                    <span class="pl-2 time-left">({{abs.friendlyDuration}} の休憩)</span>
                </div>
            `,
            controller: function($scope, adBreakService, $interval) {
                const $ctrl = this;

                $scope.abs = adBreakService;

                $scope.timeLeftDisplay = "0:00";

                function updateTimeLeftDisplay() {
                    const endsAt = moment(adBreakService.adRunning
                        ? adBreakService.endsAt
                        : adBreakService.nextAdBreak
                    );
                    const now = moment();

                    if (now.isAfter(endsAt)) {
                        $scope.timeLeftDisplay = adBreakService.adRunning
                            ? "終了"
                            : "まもなく";
                        return;
                    }

                    const secondsLeft = Math.abs(now.diff(endsAt, "seconds"));

                    const allSecs = Math.round(secondsLeft);

                    const hours = Math.floor(allSecs / (60 * 60));

                    const divisorForMinutes = allSecs % (60 * 60);
                    const minutes = Math.floor(divisorForMinutes / 60);

                    const divisorForSeconds = divisorForMinutes % 60;
                    const seconds = Math.ceil(divisorForSeconds);

                    const minDisplay = minutes.toString().padStart(1, "0"),
                        secDisplay = seconds.toString().padStart(2, "0");

                    $scope.timeLeftDisplay = `${hours > 0 ? `${hours}:` : ""}${minDisplay}:${secDisplay}`;
                }

                $ctrl.$onInit = function() {
                    updateTimeLeftDisplay();
                };

                $interval(() => {
                    updateTimeLeftDisplay();
                }, 1000);
            }
        });
}());
