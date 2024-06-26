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
                    name: "名前",
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
                    name: "間隔",
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
                    name: "必要なチャット行数",
                    icon: "fa-align-center",
                    headerStyles: {
                        'min-width': '175px'
                    },
                    cellTemplate: `{{data.requiredChatLines}}`,
                    cellController: () => {}
                },
                {
                    name: "演出",
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
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> 有効化の切り替え</a>`,
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
                                    title: "タイマーの削除",
                                    question: `タイマー "${item.name}" を削除しますか?`,
                                    confirmLabel: "削除する",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
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
                    name: "名前",
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
                    name: "予定",
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
                    name: "演出",
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
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> 有効化の切り替え</a>`,
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
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> Delete</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "演出予定リストの削除",
                                    question: `リスト "${item.name}" を削除しますか?`,
                                    confirmLabel: "削除する",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
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
