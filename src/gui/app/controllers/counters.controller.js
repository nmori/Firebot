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
                    name: "NAME",
                    icon: "fa-user",
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`
                },
                {
                    name: "VALUE",
                    icon: "fa-tally",
                    dataField: "value",
                    sortable: true,
                    cellTemplate: `{{data.value}}`
                },
                {
                    name: "MINIMUM",
                    icon: "fa-arrow-to-bottom",
                    dataField: "minimum",
                    sortable: true,
                    cellTemplate: `{{data.minimum ? data.minimum : '該当なし'}}`
                },
                {
                    name: "MAXIMUM",
                    icon: "fa-arrow-to-top",
                    dataField: "maximum",
                    sortable: true,
                    cellTemplate: `{{data.maximum ? data.maximum : '該当なし'}}`
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
                                    title: "カウンターを削除",
                                    question: `カウンター "${item.name}" を削除してもよろしいですか？`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
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
                        label: "カウンター名を変更",
                        saveText: "保存",
                        validationFn: (value) => {
                            return new Promise((resolve) => {
                                if (value == null || value.trim().length < 1) {
                                    resolve(false);
                                } else if (countersService.counterNameExists(value)) {
                                    resolve(false);
                                } else {
                                    resolve(true);
                                }
                            });
                        },
                        validationText: "カウンター名は空にできず、一意である必要があります。"
                    },
                    (newName) => {
                        counter.name = newName;
                        countersService.renameCounter(counter.id, newName);
                    });
            };
        });
}());
