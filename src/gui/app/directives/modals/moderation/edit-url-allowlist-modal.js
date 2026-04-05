"use strict";

(function() {
    angular.module("firebotApp")
        .component("editUrlAllowlistModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">URL許可リストを編集</h4>
            </div>
            <div class="modal-body">
                <p class="muted" style="margin-bottom:10px;">ここに登録されたURL文字列を含むメッセージは自動的に許可されます。</p>
                <p class="muted" style="margin-bottom:20px;">注意: 1つのメッセージ内に複数URLがあり、そのうち1つでも未許可の場合はメッセージ全体が削除されます。</p>
                <div style="margin: 0 0 25px;display: flex;flex-direction: row;">

                    <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" id="add-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            <span class="dropdown-text"><i class="fas fa-plus-circle"></i> URLを追加</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="add-options">
                            <li role="menuitem" ng-click="$ctrl.addUrl()"><a href style="padding-left: 10px;"><i class="fad fa-plus-circle" style="margin-right: 5px;"></i> URLを1件追加</a></li>
                            <li role="menuitem" ng-click="$ctrl.showImportModal()"><a href style="padding-left: 10px;"><i class="fad fa-file-import" style="margin-right: 5px;"></i> .txtファイルからインポート <tooltip text="'.txtファイルからURL一覧をインポートします'"></tooltip></a></li>
                        </ul>
                    </div>

                    <div style="display: flex;flex-direction: row;justify-content: space-between;margin-left: auto;">
                        <searchbar placeholder-text="URLを検索..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
                    </div>
                </div>
                <div>
                    <sortable-table
                        table-data-set="$ctrl.cms.chatModerationData.urlAllowlist"
                        headers="$ctrl.urlHeaders"
                        query="$ctrl.search"
                        clickable="false"
                        starting-sort-field="createdAt"
                        sort-initially-reversed="true"
                        page-size="5"
                        no-data-message="許可URLはまだ保存されていません。">
                    </sortable-table>
                </div>
            </div>
            <div class="modal-footer">
                <button ng-show="$ctrl.cms.chatModerationData.urlAllowlist.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllUrls()">許可URLをすべて削除</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(chatModerationService, utilityService) {
                const $ctrl = this;

                $ctrl.search = "";

                $ctrl.cms = chatModerationService;

                $ctrl.$onInit = function() {
                // When the component is initialized
                // This is where you can start to access bindings, such as variables stored in 'resolve'
                // IE $ctrl.resolve.shouldDelete or whatever
                };

                $ctrl.urlHeaders = [
                    {
                        name: "テキスト",
                        icon: "fa-quote-right",
                        dataField: "text",
                        headerStyles: {
                            'width': '375px'
                        },
                        sortable: true,
                        cellTemplate: `{{data.text}}`,
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
                                chatModerationService.removeAllowedUrlByText($scope.data.text);
                            };
                        }
                    }
                ];

                $ctrl.addUrl = () => {
                    utilityService.openGetInputModal(
                        {
                            model: "",
                            label: "許可URLを追加",
                            saveText: "追加",
                            inputPlaceholder: "許可URLを入力",
                            validationFn: (value) => {
                                return new Promise((resolve) => {
                                    if (value == null || value.trim().length < 1 || value.trim().length > 359) {
                                        resolve(false);
                                    } else if (chatModerationService.chatModerationData.urlAllowlist
                                        .some(u => u.text === value.toLowerCase())) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            },
                            validationText: "許可URLは空にできず、既存値と重複できません。"

                        },
                        (newUrl) => {
                            chatModerationService.addAllowedUrls([newUrl.trim()]);
                        });
                };

                $ctrl.showImportModal = () => {
                    utilityService.showModal({
                        component: "txtFileWordImportModal",
                        size: 'sm',
                        resolveObj: {},
                        closeCallback: async (data) => {
                            const success = await chatModerationService.importUrlAllowlist(data);

                            if (!success) {
                                utilityService.showErrorModal("URL許可リストのインポート中にエラーが発生しました。詳細はログを確認してください。");
                            }

                            return success;
                        }
                    });
                };

                $ctrl.deleteAllUrls = function() {
                    utilityService.showConfirmationModal({
                        title: "許可URLをすべて削除",
                        question: `許可URLをすべて削除してもよろしいですか？`,
                        confirmLabel: "削除",
                        confirmBtnType: "btn-danger"
                    }).then((confirmed) => {
                        if (confirmed) {
                            chatModerationService.removeAllAllowedUrls();
                        }
                    });
                };
            }
        });
}());