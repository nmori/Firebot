"use strict";
(function() {
    angular
        .module("firebotApp")
        .controller("rolesAndRanksController", function($scope, utilityService, viewerRolesService, viewerRanksService) {

            $scope.activeTab = 0;
            $scope.viewerRolesService = viewerRolesService;

            $scope.showAddOrEditCustomRoleModal = (role) => {
                utilityService.showModal({
                    component: "addOrEditCustomRoleModal",
                    breadcrumbName: "カスタムロールを追加/編集",
                    size: "sm",
                    resolveObj: {
                        role: () => role
                    },
                    closeCallback: (resp) => {
                        const { action, role } = resp;

                        switch (action) {
                            case "save":
                                viewerRolesService.saveCustomRole(role);
                                break;
                            case "delete":
                                viewerRolesService.deleteCustomRole(role.id);
                                break;
                        }
                    }
                });
            };

            $scope.showViewTwitchRoleModal = (role) => {
                utilityService.showModal({
                    component: "viewTwitchRoleModal",
                    breadcrumbName: "Twitch ロールを表示",
                    size: "sm",
                    resolveObj: {
                        role: () => role
                    }
                });
            };

            /**
             * Ranks
             */
            $scope.viewerRanksService = viewerRanksService;

            $scope.rankLadderHeaders = [
                {
                    name: "NAME",
                    icon: "fa-tag",
                    dataField: "name",
                    sortable: true,
                    cellTemplate: `{{data.name}}`
                },
                {
                    name: "MODE",
                    icon: "fa-bring-forward",
                    cellTemplate: `{{data.mode | capitalize}}`
                },
                {
                    name: "RANKS",
                    icon: "fa-medal",
                    cellTemplate: `{{data.ranks.length}}`
                }
            ];

            $scope.rankLadderMenuOptions = (item) => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> 編集</a>`,
                        click: function () {
                            viewerRanksService.showAddOrEditRankLadderModal(item);
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-clone" style="margin-right: 10px;"></i> 複製</a>`,
                        click: function () {
                            viewerRanksService.duplicateRankLadder(item.id);
                        }
                    },
                    ...(item.mode === "auto" ?
                        [{
                            html: `<a href ><i class="far fa-calculator" style="margin-right: 10px;"></i> ランクを再計算</a>`,
                            click: function () {
                                viewerRanksService.showRecalculateRanksModal(item);
                            }
                        }
                        ] : []
                    ),
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: function () {
                            utilityService
                                .showConfirmationModal({
                                    title: "ランクラダーを削除",
                                    question: `ランクラダー "${item.name}" を削除してもよろしいですか？`,
                                    confirmLabel: "削除",
                                    confirmBtnType: "btn-danger"
                                })
                                .then((confirmed) => {
                                    if (confirmed) {
                                        viewerRanksService.deleteRankLadder(item.id);
                                    }
                                });

                        },
                        compile: true
                    }
                ];

                return options;
            };
        });
})();
