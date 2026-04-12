"use strict";
(function () {
    angular
        .module("firebotApp")
        .controller("effectQueuesController", function (
            $scope,
            effectQueuesService,
            utilityService,
            backendCommunicator
        ) {
            $scope.effectQueuesService = effectQueuesService;

            $scope.onEffectQueuesUpdated = (items) => {
                effectQueuesService.saveAllEffectQueues(items);
            };

            $scope.getQueueModeName = (modeId) => {
                const mode = effectQueuesService.queueModes.find(m => m.value === modeId);
                return mode ? mode.label : "不明";
            };

            $scope.headers = [
                {
                    name: "NAME",
                    icon: "fa-user",
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`,
                    cellController: () => { }
                },
                {
                    name: "MODE",
                    icon: "fa-bring-forward",
                    dataField: "mode",
                    sortable: true,
                    cellTemplate: `{{getQueueModeName(data.mode)}}`,
                    cellController: ($scope) => {
                        $scope.getQueueModeName = (modeId) => {
                            const mode = effectQueuesService.queueModes.find(m => m.value === modeId);
                            return mode ? mode.label : "不明";
                        };
                    }
                },
                {
                    name: "INTERVAL/DELAY",
                    icon: "fa-clock",
                    dataField: "interval",
                    sortable: true,
                    cellTemplate: `{{(data.mode === 'interval' || data.mode === 'auto') ? (data.interval || 0) + '秒' : '該当なし'}}`,
                    cellController: () => { }
                }
            ];

            $scope.effectQueueOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen mr-4"></i> 編集</a>`,
                        click: function () {
                            effectQueuesService.showAddEditEffectQueueModal(item.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${item.active ? "エフェクトキューを無効化" : "エフェクトキューを有効化"}</a>`,
                        click: function () {
                            effectQueuesService.toggleEffectQueue(item);
                        }
                    },
                    {
                        html: `<a href ><i class="fad fa-minus-circle mr-4"></i> キューをクリア</a>`,
                        click: function () {
                            effectQueuesService.clearEffectQueue(item.id);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone mr-4"></i> 複製</a>`,
                        click: function () {
                            effectQueuesService.duplicateEffectQueue(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt mr-4"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "エフェクトキューを削除",
                                    question: `エフェクトキュー "${item.name}" を削除してもよろしいですか？`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        effectQueuesService.deleteEffectQueue(item.id);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };


            $scope.openEffectQueueMonitor = () => {
                backendCommunicator.send("open-effect-queue-monitor");
            };
        });
}());
