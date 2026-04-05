"use strict";

(function() {
    angular.module("firebotApp")
        .component("editUserAllowlistModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">ユーザー許可リストを編集</h4>
            </div>
            <div class="modal-body">
                <p class="muted">このリストのユーザーは、チャットでURL投稿が自動的に許可されます。</p>
                <div class="flex flex-row justify-between my-10">
                    <button class="btn btn-primary" type="button" aria-haspopup="true" ng-click="$ctrl.showViewerSearchModal()">
                        <span class="dropdown-text"><i class="fas fa-plus-circle"></i> ユーザーを追加</span>
                    </button>

                    <div class="ml-auto">
                        <searchbar placeholder-text="ユーザーを検索..." query="$ctrl.search" class="basis-250"></searchbar>
                    </div>
                </div>
                <div>
                    <sortable-table
                        table-data-set="$ctrl.cms.chatModerationData.userAllowlist"
                        headers="$ctrl.userHeaders"
                        query="$ctrl.search"
                        clickable="false"
                        starting-sort-field="createdAt"
                        sort-initially-reversed="true"
                        page-size="5"
                        no-data-message="許可されたユーザーはまだ保存されていません。">
                    </sortable-table>
                </div>
            </div>
            <div class="modal-footer">
                <button ng-show="$ctrl.cms.chatModerationData.userAllowlist.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllUsers()">許可ユーザーをすべて削除</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(chatModerationService, utilityService, logger) {
                const $ctrl = this;

                $ctrl.search = "";

                $ctrl.cms = chatModerationService;

                $ctrl.userHeaders = [
                    {
                        name: "ユーザー",
                        icon: "fa-user",
                        dataField: "username",
                        headerStyles: {
                            'width': '375px'
                        },
                        sortable: true,
                        cellTemplate: `{{data.displayName}}`,
                        cellController: () => {}
                    },
                    {
                        name: "追加日時",
                        icon: "fa-calendar",
                        dataField: "createdAt",
                        sortable: true,
                        cellTemplate: `{{data.createdAt | prettyDate}}`,
                        cellController: () => {}
                    },
                    {
                        headerStyles: {
                            'width': '15px'
                        },
                        cellStyles: {
                            'width': '15px'
                        },
                        sortable: false,
                        cellTemplate: `<i class="fal fa-trash-alt clickable" style="color:#ff3737;" ng-click="clicked()" uib-tooltip="削除" tooltip-append-to-body="true"></i>`,
                        cellController: ($scope, chatModerationService) => {
                            $scope.clicked = () => {
                                chatModerationService.removeAllowedUserById($scope.data.id);
                            };
                        }
                    }
                ];

                $ctrl.showViewerSearchModal = () => {
                    utilityService.openViewerSearchModal(
                        {
                            label: "ユーザーを追加",
                            saveText: "追加"
                        },
                        (user) => {
                            chatModerationService.addAllowedUser(user);
                        });
                };

                $ctrl.deleteAllUsers = function() {
                    utilityService.showConfirmationModal({
                        title: "許可ユーザーをすべて削除",
                        question: `許可ユーザーをすべて削除してもよろしいですか？`,
                        confirmLabel: "削除",
                        confirmBtnType: "btn-danger"
                    }).then((confirmed) => {
                        if (confirmed) {
                            chatModerationService.removeAllAllowedUsers();
                        }
                    });
                };
            }
        });
}());