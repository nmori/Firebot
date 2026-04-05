"use strict";

// Modal for adding or editting a command

(function() {
    angular.module("firebotApp").component("addOrEditTimerModal", {
        template: `
            <context-menu-modal-header
                on-close="$ctrl.dismiss()"
                trigger-type="timer"
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
                        <span class="input-group-addon">必要チャット行数 <tooltip text="'前回の実行から必要な最小チャット行数です。'"></tooltip></span>
                        <input type="number" class="form-control" ng-model="$ctrl.timer.requiredChatLines" placeholder="">
                    </div>
                    <div class="controls-fb-inline">
                        <label class="control-fb control--checkbox" ng-hide="$ctrl.isNewTimer">有効
                            <input type="checkbox" ng-model="$ctrl.timer.active" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox">配信中のみ実行 <tooltip text="'配信外でもこのタイマーを実行したい場合はチェックを外してください。'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.timer.onlyWhenLive" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </div>

                <div class="function-button-settings" style="margin-top: 15px;">
                    <effect-list
                        header="このタイマーで実行する内容"
                        effects="$ctrl.timer.effects"
                        trigger="timer"
                        trigger-meta="{ rootEffects: $ctrl.timer.effects }"
                        update="$ctrl.effectListUpdated(effects)"
                        modalId="{{$ctrl.modalId}}"
                    ></effect-list>
                </div>
                <p class="muted" style="font-size:11px;margin-top:6px;">
                    <b>ヒント:</b> このタイマーでチャットメッセージを1つずつ表示したい場合は、エフェクトリストの実行モードを <strong>順番</strong> または <strong>ランダム</strong> に設定してください。
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
            };

            $ctrl.effectListUpdated = function(effects) {
                $ctrl.timer.effects = effects;
            };

            function timerValid() {
                if ($ctrl.timer.name === "") {
                    ngToast.create("タイマー名を入力してください。");
                    return false;
                } else if (
                    $ctrl.timer.interval == null
                    || $ctrl.timer.interval === ""
                    || $ctrl.timer.interval <= 0
                ) {
                    ngToast.create("タイマー間隔は0より大きい値を指定してください。");
                    return false;
                }
                return true;
            }

            $ctrl.save = function() {
                if (!timerValid()) {
                    return;
                }

                const successful = timerService.saveTimer($ctrl.timer);
                if (successful) {
                    $ctrl.close({
                        $value: {
                            timer: $ctrl.timer
                        }
                    });
                } else {
                    ngToast.create("タイマーの保存に失敗しました。再度お試しいただくか、詳細はログをご確認ください。");
                }
            };
        }
    });
}());