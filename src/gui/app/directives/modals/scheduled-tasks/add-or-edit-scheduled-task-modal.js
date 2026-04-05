"use strict";

(function() {
    angular.module("firebotApp").component("addOrEditScheduledTaskModal", {
        template: `
            <context-menu-modal-header
                on-close="$ctrl.dismiss()"
                trigger-type="scheduled effect list"
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
                    <label class="control-fb control--radio">簡易スケジュール
                        <input type="radio" ng-model="$ctrl.scheduledTask.inputType" value="simple"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio">詳細スケジュール
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
                        <span class="input-group-addon">スケジュール <tooltip text="'スケジュールは crontab 形式で入力してください。式の作成は crontab.guru が便利です。'"></tooltip></span>
                        <input type="text" class="form-control" ng-model="$ctrl.scheduledTask.schedule" ng-change="$ctrl.updateScheduleData()">
                    </div>
                    <div class="muted pb-6">{{$ctrl.scheduleFriendlyName}}</div>
                    <div class="controls-fb-inline">
                        <label class="control-fb control--checkbox" ng-hide="$ctrl.isNewScheduledTask">有効
                            <input type="checkbox" ng-model="$ctrl.scheduledTask.enabled" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                        <label class="control-fb control--checkbox">配信中のみ実行 <tooltip text="'配信外でもこのスケジュール済みエフェクトリストを実行したい場合はチェックを外してください。'"></tooltip>
                            <input type="checkbox" ng-model="$ctrl.scheduledTask.onlyWhenLive" aria-label="...">
                            <div class="control__indicator"></div>
                        </label>
                    </div>
                </div>

                <div class="function-button-settings" style="margin-top: 15px;">
                    <effect-list
                        header="このスケジュール済みエフェクトリストで実行する内容"
                        effects="$ctrl.scheduledTask.effects"
                        trigger="scheduledTask"
                        trigger-meta="{ rootEffects: $ctrl.scheduledTask.effects }"
                        update="$ctrl.effectListUpdated(effects)"
                        modalId="{{$ctrl.modalId}}"
                    ></effect-list>
                </div>
                <p class="muted" style="font-size:11px;margin-top:6px;">
                    <strong>ヒント:</strong> このスケジュール済みエフェクトリストでチャットメッセージを1つずつ表示したい場合は、エフェクトリストの実行モードを <strong>順番</strong> または <strong>ランダム</strong> に設定してください。
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
                "0 * * * *": "毎時",
                "0 0 * * *": "毎日",
                "0 0 1 * *": "毎月",
                "0 0 * * 1-5": "平日毎日"
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
                } catch {
                    return false;
                }

                return true;
            }

            function scheduledTaskValid() {
                if ($ctrl.scheduledTask.name === "") {
                    ngToast.create("スケジュール済みエフェクトリストの名前を入力してください。");
                    return false;
                } else if ($ctrl.scheduledTask.schedule.length < 1 || isScheduleValid($ctrl.scheduledTask.schedule) !== true) {
                    ngToast.create("スケジュール済みエフェクトリストに有効な cron スケジュールを入力してください。");
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

                const successful = scheduledTaskService.saveScheduledTask($ctrl.scheduledTask);
                if (successful) {
                    $ctrl.close({
                        $value: {
                            scheduledTask: $ctrl.scheduledTask
                        }
                    });
                } else {
                    ngToast.create("スケジュール済みエフェクトリストの保存に失敗しました。再試行するかログを確認してください。");
                }
            };
        }
    });
}());
