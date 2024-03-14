"use strict";

// Modal for adding or editting a command

(function() {
    angular.module("firebotApp").component("addOrEditTimerModal", {
        template: `
            <context-menu-modal-header
                on-close="$ctrl.dismiss()"
                trigger-type="タイマー"
                trigger-name="$ctrl.timer.name"
                sort-tags="$ctrl.timer.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>
            <div class="modal-body">
                <div class="general-button-settings">
                    <div class="settings-title">
                        <h3>一般設定</h3>
                    </div>
                    <div class="input-group pb-6 settings-commandGroup-groupName">
                        <span class="input-group-addon">名前</span>
                        <input type="text" class="form-control" ng-model="$ctrl.timer.name">
                    </div>
                    <div class="input-group pb-6 settings-commandGroup-timer">
                        <span class="input-group-addon">間隔(秒)</span>
                        <input type="number" class="form-control" ng-model="$ctrl.timer.interval" placeholder="秒">
                    </div>
                    <div class="input-group pb-6 settings-commandGroup-timer">
                        <span class="input-group-addon">必須チャット行数<tooltip text="'起動に必要なチャットの経過行数'"></tooltip></span>
                        <input type="number" class="form-control" ng-model="$ctrl.timer.requiredChatLines" placeholder="">
                    </div>
                    <div class="controls-fb-inline">
                        <label class="control-fb control--checkbox" ng-hide="$ctrl.isNewTimer">有効
                            <input type="checkbox" ng-model="$ctrl.timer.active" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox">配信時のみ <tooltip text="'配信中でなくてもタイマーを作動させたい場合は、このチェックを外してください。'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.timer.onlyWhenLive" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </div>

                <div class="function-button-settings" style="margin-top: 15px;">
                    <effect-list
                        header="このタイマーが行う内容"
                        effects="$ctrl.timer.effects"
                        trigger="timer"
                        trigger-meta="{ rootEffects: $ctrl.timer.effects }"
                        update="$ctrl.effectListUpdated(effects)"
                        modalId="{{$ctrl.modalId}}"
                    ></effect-list>
                </div>
                <p class="muted" style="font-size:11px;margin-top:6px;">
                    <b>ヒント:</b> このタイマーに一度に一つのチャットメッセージを表示させたい場合は、<b>演出のランダム実行</b>または<b>演出の順番実行</b>をお試しください。
                </p>
            </div>

            <div class="modal-footer">
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
        controller: function($scope, utilityService, ngToast, timerService) {
            const $ctrl = this;

            $ctrl.timer = {
                active: true,
                onlyWhenLive: true,
                name: "",
                interval: 0,
                requiredChatLines: 5,
                sortTags: []
            };

            $ctrl.$onInit = function() {
                if ($ctrl.resolve.timer == null) {
                    $ctrl.isNewTimer = true;
                } else {
                    $ctrl.timer = JSON.parse(JSON.stringify($ctrl.resolve.timer));
                }

                const modalId = $ctrl.resolve.modalId;
                $ctrl.modalId = modalId;
                utilityService.addSlidingModal(
                    $ctrl.modalInstance.rendered.then(() => {
                        const modalElement = $(`.${modalId}`).children();
                        return {
                            element: modalElement,
                            name: "編集",
                            id: modalId,
                            instance: $ctrl.modalInstance
                        };
                    })
                );

                $scope.$on("modal.closing", function() {
                    utilityService.removeSlidingModal();
                });
            };

            $ctrl.effectListUpdated = function(effects) {
                $ctrl.timer.effects = effects;
            };

            function timerValid() {
                if ($ctrl.timer.name === "") {
                    ngToast.create("名前を入れてください");
                    return false;
                } else if ($ctrl.timer.interval < 1) {
                    ngToast.create("間隔は 0より大きい値にしてください");
                    return false;
                }
                return true;
            }

            $ctrl.save = function() {
                if (!timerValid()) {
                    return;
                }

                timerService.saveTimer($ctrl.timer).then(successful => {
                    if (successful) {
                        $ctrl.close({
                            $value: {
                                timer: $ctrl.timer
                            }
                        });
                    } else {
                        ngToast.create("タイマーの保存に失敗しました。再試行するか、ログを参照してください。");
                    }
                });
            };
        }
    });
}());
