"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("presetEffectListsController", function(
            $scope,
            presetEffectListsService,
            utilityService
        ) {
            $scope.presetEffectListsService = presetEffectListsService;

            $scope.onPresetEffectListsUpdated = (items) => {
                presetEffectListsService.saveAllPresetEffectLists(items);
            };

            $scope.headers = [
                {
                    name: "NAME",
                    icon: "fa-user",
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`,
                    cellController: () => {}
                },
                {
                    name: "EFFECTS",
                    icon: "fa-magic",
                    cellTemplate: `{{data.effects ? data.effects.list.length : 0}}`,
                    cellController: () => {}
                }
            ];

            $scope.presetEffectListOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: function () {
                            presetEffectListsService.showAddEditPresetEffectListModal(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: function () {
                            presetEffectListsService.duplicatePresetEffectList(item.id);
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "プリセット演出リストを消す",
                                    question: `本当に削除しますか "${item.name}"?`,
                                    confirmLabel: "削除する",
                                    confirmBtnType: "btn-danger"
                                })
                                .then(confirmed => {
                                    if (confirmed) {
                                        presetEffectListsService.deletePresetEffectList(item.id);
                                    }
                                });

                        }
                    }
                ];

                return options;
            };
        });
}());
