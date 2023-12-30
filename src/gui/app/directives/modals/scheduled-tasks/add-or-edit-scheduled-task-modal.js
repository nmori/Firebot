"use strict";

(function() {
    angular.module("firebotApp").component("addOrEditScheduledTaskModal", {
        template: `
            <context-menu-modal-header
                on-close="$ctrl.dismiss()"
                trigger-type="予定された演出リスト"
                trigger-name="$ctrl.scheduledTask.name"
                sort-tags="$ctrl.scheduledTask.sortTags"
                show-trigger-name="true"
            ></context-menu-modal-header>
            <div class="modal-body">
                <div class="general-button-settings">
                    <div class="settings-title">
                        <h3>一般設定</h3>
                    </div>
                    <div class="input-group pb-6 settings-commandGroup-groupName">
                        <span class="input-group-addon">名前</span>
                        <input type="text" class="form-control" ng-model="$ctrl.scheduledTask.name">
                    </div>
                    <label class="control-fb control--radio">簡単な予定
                        <input type="radio" ng-model="$ctrl.scheduledTask.inputType" value="simple"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio">詳細な予定
                        <input type="radio" ng-model="$ctrl.scheduledTask.inputType" value="advanced"/>
                        <div class="control__indicator"></div>
                    </label>
                    <div class="input-group pb-6 settings-commandGroup-scheduledTask" ng-if="$ctrl.scheduledTask.inputType === 'simple'">
                        <dropdown-select
                            options="$ctrl.simpleSchedules"
                            selected="$ctrl.scheduledTask.schedule"
                            on-update="$ctrl.updateScheduleData()"></dropdown-select>
                    </div>
                    <div class="input-group pb-6 settings-commandGroup-scheduledTask" ng-if="$ctrl.scheduledTask.inputType === 'advanced'">
                        <span class="input-group-addon">予定 <tooltip text="'予定の入力はcrontab形式で書く必要があります。crontab式の作成については、crontab.guruを参照してください。'"></tooltip></span>
                        <input type="text" class="form-control" ng-model="$ctrl.scheduledTask.schedule" ng-change="$ctrl.updateScheduleData()">
                    </div>
                    <div class="muted pb-6">{{$ctrl.scheduleFriendlyName}}</div>
                    <div class="controls-fb-inline">
                        <label class="control-fb control--checkbox" ng-hide="$ctrl.isNewScheduledTask">有効
                            <input type="checkbox" ng-model="$ctrl.scheduledTask.enabled" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox">配信中のときのみ <tooltip text="'この予定された演出リストで、あなたが配信中でなくても演出を実行したい場合は、このチェックを外してください。'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.scheduledTask.onlyWhenLive" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </div>

                <div class="function-button-settings" style="margin-top: 15px;">
                    <effect-list header="この予定で何をしますか？" effects="$ctrl.scheduledTask.effects" trigger="scheduledTask" trigger-meta="$ctrl.triggerMeta" update="$ctrl.effectListUpdated(effects)" modalId="{{$ctrl.modalId}}"></effect-list>
                </div>
                <p class="muted" style="font-size:11px;margin-top:6px;">
                    <b>ヒント:</b>この予定された演出リストに、一度に1つのチャットメッセージを表示させたい場合,  <b>演出のランダム実行</b> か <b>演出の順番実行</b>をお試しください。
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
        controller: function($scope, utilityService, ngToast, scheduledTaskService) {
            const $ctrl = this;

            $ctrl.scheduledTask = {
                name: "",
                enabled: true,
                schedule: "0 * * * *",
                inputType: "simple",
                onlyWhenLive: true,
                effects: [],
                sortTags: []
            };

            $ctrl.simpleSchedules = {
                "* * * * *": "毎分",
                "0 * * * *": "毎時間",
                "0 0 * * *": "毎日",
                "0 0 1 * *": "毎月",
                "0 0 * * 1-5": "毎週"
            };

            $ctrl.scheduleFriendlyName = "";
            $ctrl.parsedSchedule = {};

            $ctrl.$onInit = function() {
                if ($ctrl.resolve.scheduledTask == null) {
                    $ctrl.isNewScheduledTask = true;
                } else {
                    $ctrl.scheduledTask = JSON.parse(JSON.stringify($ctrl.resolve.scheduledTask));
                }

                $ctrl.updateScheduleData();

                const modalId = $ctrl.resolve.modalId;
                $ctrl.modalId = modalId;
                utilityService.addSlidingModal(
                    $ctrl.modalInstance.rendered.then(() => {
                        const modalElement = $(`.${modalId}`).children();
                        return {
                            element: modalElement,
                            name: "予定された演出リストの編集",
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
                $ctrl.scheduledTask.effects = effects;
            };

            function isScheduleValid() {
                const { CronTime } = require("cron");
                try {
                    const crontime = new CronTime($ctrl.scheduledTask.schedule);
                    if (crontime == null) {
                        return false;
                    }
                } catch (error) {
                    return false;
                }

                return true;
            }

            function scheduledTaskValid() {
                if ($ctrl.scheduledTask.name === "") {
                    ngToast.create("予定された演出リストの名称をご記入ください。");
                    return false;
                } else if ($ctrl.scheduledTask.schedule.length < 1 || isScheduleValid($ctrl.scheduledTask.schedule) !== true) {
                    ngToast.create("予定された演出リストには、有効な書き方（cron形式）で入力してください。");
                    return false;
                }
                return true;
            }

            $ctrl.setSimpleSchedule = function(schedule) {
                $ctrl.scheduledTask.schedule = schedule;
                $ctrl.updateScheduleData();
            };

            $ctrl.updateScheduleData = function() {
                $ctrl.updateFriendlyCronSchedule();
                $ctrl.updateParsedSchedule();
            };

            $ctrl.updateFriendlyCronSchedule = function() {
                $ctrl.scheduleFriendlyName = scheduledTaskService.getFriendlyCronSchedule($ctrl.scheduledTask.schedule);
            };

            $ctrl.updateParsedSchedule = function() {
                $ctrl.parsedSchedule = scheduledTaskService.parseSchedule($ctrl.scheduledTask.schedule);
            };

            $ctrl.save = function() {
                if (!scheduledTaskValid()) {
                    return;
                }

                scheduledTaskService.saveScheduledTask($ctrl.scheduledTask).then(successful => {
                    if (successful) {
                        $ctrl.close({
                            $value: {
                                scheduledTask: $ctrl.scheduledTask
                            }
                        });
                    } else {
                        ngToast.create("予定された演出リストの保存に失敗しました。再試行するか、ログで詳細を確認してください。");
                    }
                });
            };
        }
    });
}());
