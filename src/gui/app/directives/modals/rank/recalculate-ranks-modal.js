"use strict";
(function() {

    angular.module("firebotApp").component("recalculateRanksModal", {
        template: `
            <div class="modal-header">
                <h4 class="modal-title">
                    <div class="action text-4xl">全視聴者のランクを再計算</div>
                </h4>
            </div>
            <div class="modal-body text-center">
                <div ng-hide="$ctrl.hasFinished">
                    <p ng-hide="$ctrl.hasStarted">
                        {{$ctrl.rankLadder.name}} ラダーのランクを全視聴者分再計算します。視聴者数によっては時間がかかる場合があります。
                    </p>
                    <div ng-show="$ctrl.hasStarted">
                        <p>ランクを再計算中...</p>
                        <uib-progressbar
                            class="progress-striped active"
                            value="$ctrl.completionPercentage"
                        >
                            <i>{{$ctrl.processedViewers}} / {{ $ctrl.totalViewers }}</i>
                        </uib-progressbar>
                    </div>
                </div>
                <div ng-show="$ctrl.hasFinished">
                    <i class="fa fa-check-circle text-success" style="font-size: 15rem;"></i>
                    <p>ランクの再計算が完了しました。</p>
                </div>
            </div>
            <div class="modal-footer text-center">
                <button type="button" class="btn btn-default" ng-click="$ctrl.cancel()">{{$ctrl.hasFinished ? '閉じる' : 'キャンセル'}}</button>
                <button ng-if="!$ctrl.hasStarted && !$ctrl.hasFinished" type="button" class="btn btn-primary" ng-click="$ctrl.start()">再計算</button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&",
            modalInstance: "<"
        },
        controller: function(backendCommunicator, utilityService) {
            const $ctrl = this;

            $ctrl.rankLadder = {};

            $ctrl.hasStarted = false;
            $ctrl.totalViewers = 0;
            $ctrl.processedViewers = 0;
            $ctrl.completionPercentage = 0;
            $ctrl.hasFinished = false;

            $ctrl.$onInit = () => {
                $ctrl.rankLadder = $ctrl.resolve.rankLadder;

                $ctrl.hasStarted = false;
                $ctrl.hasFinished = false;

                $ctrl.processedViewers = 0;
                $ctrl.completionPercentage = 0;

                backendCommunicator.fireEventAsync("get-viewer-count")
                    .then((viewerCount) => {
                        $ctrl.totalViewers = viewerCount;
                    });

                backendCommunicator.on("rank-recalculation:progress", (processedCount) => {
                    $ctrl.processedViewers = processedCount;
                    if ($ctrl.totalViewers > 0) {
                        $ctrl.completionPercentage = Math.round(($ctrl.processedViewers / $ctrl.totalViewers) * 100);
                    }
                });

                backendCommunicator.on("rank-recalculation:complete", () => {
                    $ctrl.hasFinished = true;
                    $ctrl.hasStarted = false;
                });
            };

            $ctrl.cancel = () => {
                if ($ctrl.hasStarted) {
                    utilityService.showConfirmationModal({
                        title: "確認",
                        question: "ランク再計算をキャンセルしてもよろしいですか？",
                        confirmLabel: "はい、キャンセル",
                        confirmBtnType: "btn-danger",
                        cancelLabel: "いいえ、続行"
                    }).then((confirmed) => {
                        if (confirmed) {
                            backendCommunicator.fireEvent("rank-recalculation:cancel");
                            $ctrl.dismiss();
                        }
                    });
                } else {
                    $ctrl.dismiss();
                }
            };

            $ctrl.start = () => {
                if ($ctrl.hasStarted) {
                    return;
                }
                $ctrl.hasStarted = true;
                backendCommunicator.fireEvent("rank-recalculation:start", $ctrl.rankLadder.id);
            };
        }
    });
})();
