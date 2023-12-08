"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("countersController", function($scope, countersService, utilityService) {

            $scope.countersService = countersService;

            $scope.onCountersUpdated = (items) => {
                countersService.saveAllCounters(items);
            };

            $scope.headers = [
                {
                    name: "名前",
                    icon: "fa-user",
                    cellTemplate: `{{data.name}}`
                },
                {
                    name: "値",
                    icon: "fa-tally",
                    cellTemplate: `{{data.value}}`
                },
                {
                    name: "最小",
                    icon: "fa-arrow-to-bottom",
                    cellTemplate: `{{data.minimum ? data.minimum : 'n/a'}}`
                },
                {
                    name: "最大",
                    icon: "fa-arrow-to-top",
                    cellTemplate: `{{data.maximum ? data.maximum : 'n/a'}}`
                }
            ];

            $scope.counterOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: () => {
                            countersService.showAddEditCounterModal(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: () => {
                            countersService.duplicateCounter(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: () => {
                            utilityService
                                .showConfirmationModal({
                                    title: "カウンタの削除",
                                    question: `カウンタ「"${item.name}"」を削除しますか?`,
                                    confirmLabel: "Delete",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        countersService.deleteCounter(item.id);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };

            $scope.openRenameCounterModal = function(counter) {
                utilityService.openGetInputModal(
                    {
                        model: counter.name,
                        label: "名前変更",
                        saveText: "保存",
                        validationFn: (value) => {
                            return new Promise(resolve => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else if (countersService.counterNameExists(value)) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "カウンタ名は他で使用されていない名前である必要があります"
                    },
                    (newName) => {
                        counter.name = newName;
                        countersService.renameCounter(counter.id, newName);
                    });
            };
        });
}());
