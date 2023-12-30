"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("effectQueuesController", function(
            $scope,
            effectQueuesService,
            utilityService
        ) {
            $scope.effectQueuesService = effectQueuesService;

            $scope.onEffectQueuesUpdated = (items) => {
                effectQueuesService.saveAllEffectQueues(items);
            };

            $scope.getQueueModeName = (modeId) => {
                const mode = effectQueuesService.queueModes.find(m => m.id === modeId);
                return mode ? mode.display : "不明";
            };

            $scope.headers = [
                {
                    name: "名前",
                    icon: "fa-user",
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "モード",
                    icon: "fa-bring-forward",
                    cellTemplate: `{{getQueueModeName(data.mode)}}`,
                    cellController: ($scope) => {
                        $scope.getQueueModeName = (modeId) => {
                            const mode = effectQueuesService.queueModes.find(m => m.id === modeId);
                            return mode ? mode.display : "不明";
                        };
                    }
                },
                {
                    name: "周期/遅延",
                    icon: "fa-clock",
                    cellTemplate: `{{(data.mode === 'interval' || data.mode === 'auto') ? (data.interval || 0) + 's' : 'n/a'}}`,
                    cellController: () => {}
                },
                {
                    name: "キューの長さ",
                    icon: "fa-tally",
                    cellTemplate: `{{data.length || 0}}`,
                    cellController: () => {}
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
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> 有効化の切り替え</a>`,
                        click: function () {
                            effectQueuesService.toggleEffectQueue(item);
                        }
                    },
                    {
                        html: `<a href ><i class="fad fa-minus-circle mr-4"></i> クリア</a>`,
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
                                    title: "演出キューの削除",
                                    question: `演出キュー「"${item.name}"」を削除しますか?`,
                                    confirmLabel: "Delete",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        effectQueuesService.deleteEffectQueue(item.id);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };
        });
}());
