"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("variableMacrosController", function($scope, utilityService, variableMacroService) {
            $scope.variableMacroService = variableMacroService;

            $scope.onMacrosUpdated = (items) => {
                variableMacroService.saveAllMacros(items);
            };

            $scope.headers = [
                {
                    name: "NAME",
                    icon: "fa-tag",
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "DESCRIPTION",
                    icon: "fa-info-circle",
                    cellTemplate: `{{data.description}}`,
                    cellController: () => {}
                }
            ];

            $scope.macroContextMenuOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: function () {
                            variableMacroService.showAddOrEditVariableMacroModal(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: function () {
                            variableMacroService.duplicateMacro(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "マクロ変数の削除",
                                    question: `マクロ変数を削除しますか？ "${item.name}"?`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        variableMacroService.deleteMacro(item.id);
                                    }
                                });
                        }
                    }
                ];

                return options;
            };
        });
}());


