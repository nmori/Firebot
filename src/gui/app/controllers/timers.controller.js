"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("timersController", function(
            $scope,
            timerService,
            scheduledTaskService,
            utilityService
        ) {

            $scope.timerService = timerService;
            $scope.scheduledTaskService = scheduledTaskService;

            $scope.activeTimerTab = 0;

            $scope.onTimersUpdated = (timers) => {
                timerService.saveAllTimers(timers);
            };

            $scope.onScheduledTasksUpdated = (tasks) => {
                scheduledTaskService.saveAllScheduledTasks(tasks);
            };

            $scope.timerHeaders = [
                {
                    name: "NAME",
                    icon: "fa-user",
                    headerStyles: {
                        'min-width': '175px'
                    },
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "INTERVAL",
                    icon: "fa-stopwatch",
                    headerStyles: {
                        'min-width': '100px'
                    },
                    dataField: "interval",
                    sortable: true,
                    cellTemplate: `{{data.interval}}`,
                    cellController: () => {}
                },
                {
                    name: "REQUIRED CHAT LINES",
                    icon: "fa-align-center",
                    headerStyles: {
                        'min-width': '175px'
                    },
                    cellTemplate: `{{data.requiredChatLines}}`,
                    cellController: () => {}
                },
                {
                    name: "EFFECTS",
                    icon: "fa-magic",
                    headerStyles: {
                        'min-width': '100px'
                    },
                    cellTemplate: `{{data.effects ? data.effects.list.length : 0}}`,
                    cellController: () => {}
                }
            ];

            $scope.timerOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: function () {
                            timerService.showAddEditTimerModal(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.active ? "タイマーを無効化" : "タイマーを有効化"}</a>`,
                        click: function () {
                            timerService.toggleTimerActiveState(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: function () {
                            timerService.duplicateTimer(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "タイマーを削除",
                                    question: `タイマー "${item.name}" を削除してもよろしいですか？`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        timerService.deleteTimer(item);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };

            $scope.scheduledTaskHeaders = [
                {
                    name: "NAME",
                    icon: "fa-user",
                    headerStyles: {
                        'min-width': '175px'
                    },
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "SCHEDULE",
                    icon: "fa-calendar-alt",
                    headerStyles: {
                        'min-width': '250px'
                    },
                    cellTemplate: `{{getFriendlyCronSchedule(data.schedule)}}`,
                    cellController: ($scope) => {
                        $scope.getFriendlyCronSchedule = (schedule) => {
                            return scheduledTaskService.getFriendlyCronSchedule(schedule);
                        };
                    }
                },
                {
                    name: "EFFECTS",
                    icon: "fa-magic",
                    headerStyles: {
                        'min-width': '100px'
                    },
                    cellTemplate: `{{data.effects ? data.effects.list.length : 0}}`,
                    cellController: () => {}
                }
            ];

            $scope.scheduledTaskOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: function () {
                            scheduledTaskService.showAddEditScheduledTaskModal(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.enabled ? "スケジュール済みエフェクトリストを無効化" : "スケジュール済みエフェクトリストを有効化"}</a>`,
                        click: function () {
                            scheduledTaskService.toggleScheduledTaskEnabledState(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: function () {
                            scheduledTaskService.duplicateScheduledTask(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "スケジュール済みエフェクトリストを削除",
                                    question: `スケジュール済みエフェクトリスト "${item.name}" を削除してもよろしいですか？`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        scheduledTaskService.deleteScheduledTask(item);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };
        });
}());
