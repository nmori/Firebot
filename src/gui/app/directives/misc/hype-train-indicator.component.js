"use strict";

(function() {

    const moment = require("moment");

    angular.module("firebotApp")
        .component("hypeTrainIndicator", {
            bindings: {},
            template: `
                <div
                    class="stream-info-stat hype-train-indicator"
                    style="margin-left:10px"
                    uib-tooltip="{{ hts.isSharedTrain ? 'Shared ' : '' }}Hype Train in progress"
                    tooltip-append-to-body="true"
                    tooltip-placement="bottom"
                >
                    <i class="fas fa-subway" style="margin-right: 5px; font-size: 12px;" />
                    <span class="level-pill">LVL {{hts.currentLevel}}</span>
                    <span ng-if="hts.isGoldenKappaTrain"
                        class="level-pill golden"
                        uib-tooltip="おめでとうございます。ゴールデン Kappa トレインは希少なイベントです。開催中に 100 ビッツのチアー、サブスク、再サブスク、サブギフトを行った人は、24 時間 Twitch のゴールデン Kappa エモートを使えるようになります。"
                        tooltip-append-to-body="true"
                        tooltip-placement="bottom"
                    >Golden Kappa</span>
                    <span ng-if="hts.isTreasureTrain"
                        class="level-pill golden"
                        uib-tooltip="おめでとうございます。トレジャートレインは希少なイベントです。一定のしきい値に達すると、そのトレインの残り時間中は Twitch がティア 1 のコミュニティサブギフトを割引します。"
                        tooltip-append-to-body="true"
                        tooltip-placement="bottom"
                    >Treasure</span>
                    <span ng-if="!hts.hypeTrainEnded" class="pl-2 font-bold">{{hts.currentProgressPercentage}}%</span>
                    <span class="pl-2 time-left">({{!hts.hypeTrainEnded ? timeLeftDisplay : 'Ended'}})</span>
                </div>
            `,
            controller: function($scope, hypeTrainService, $interval) {
                const $ctrl = this;

                $scope.hts = hypeTrainService;

                $scope.timeLeftDisplay = "0:00";

                function updateTimeLeftDisplay() {

                    const endsAt = moment(hypeTrainService.endsAt);
                    const now = moment();

                    if (now.isAfter(endsAt)) {
                        $scope.timeLeftDisplay = "0:00";
                        return;
                    }

                    const secondsLeft = Math.abs(now.diff(endsAt, "seconds"));

                    const allSecs = Math.round(secondsLeft);

                    const divisorForMinutes = allSecs % (60 * 60);
                    const minutes = Math.floor(divisorForMinutes / 60);

                    const divisorForSeconds = divisorForMinutes % 60;
                    const seconds = Math.ceil(divisorForSeconds);

                    const minDisplay = minutes.toString().padStart(1, "0"),
                        secDisplay = seconds.toString().padStart(2, "0");

                    $scope.timeLeftDisplay = `${minDisplay}:${secDisplay}`;
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
