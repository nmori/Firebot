"use strict";

(function() {

    const fs = require("fs");

    angular.module("firebotApp")
        .component("editUrlAllowlistModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">URL許可リストを編集</h4>
            </div>
            <div class="modal-body">
                <p class="muted" style="margin-bottom:10px;">ここに記載されているURL部分を含むメッセージのURLは、自動的に許可されます。</p>
                <p class="muted" style="margin-bottom:20px;">NOTE: メッセージ内に複数のURLが見つかり、そのうちのどれかが許可されていない場合、メッセージ全体が削除されます。</p>
                <div style="margin: 0 0 25px;display: flex;flex-direction: row;">

                    <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" id="add-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            <span class="dropdown-text"><i class="fas fa-plus-circle"></i> 追加するURL(s)</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="add-options">
                            <li role="menuitem" ng-click="$ctrl.addUrl()"><a href style="padding-left: 10px;"><i class="fad fa-plus-circle" style="margin-right: 5px;"></i> Add single URL</a></li>
                            <li role="menuitem" ng-click="$ctrl.showImportModal()"><a href style="padding-left: 10px;"><i class="fad fa-file-import" style="margin-right: 5px;"></i> Import from .txt file <tooltip text="'Import a list of URLs from a txt file'"></tooltip></a></li>
                        </ul>
                    </div>

                    <div style="display: flex;flex-direction: row;justify-content: space-between;margin-left: auto;">
                        <searchbar placeholder-text="Search URLs..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
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
                        no-data-message="許可されたURLが保存されていない.">
                    </sortable-table>
                </div>
            </div>
            <div class="modal-footer">
                <button ng-show="$ctrl.cms.chatModerationData.urlAllowlist.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllUrls()">許可URLを全削除</button>
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

                $ctrl.$onInit = function() {
                // When the compontent is initialized
                // This is where you can start to access bindings, such as variables stored in 'resolve'
                // IE $ctrl.resolve.shouldDelete or whatever
                };

                $ctrl.urlHeaders = [
                    {
                        name: "TEXT",
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
                        name: "CREATED AT",
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
                            label: "許可されたURLを追加する",
                            saveText: "追加",
                            inputPlaceholder: "URLを入力",
                            validationFn: (value) => {
                                return new Promise(resolve => {
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
                            validationText: "許可されたURLが空か、すでに存在しています。"

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
                        closeCallback: data => {
                            const filePath = data.filePath,
                                delimiter = data.delimiter;

                            let contents;
                            try {
                                contents = fs.readFileSync(filePath, "utf8");
                            } catch (err) {
                                logger.error("error reading file for allowed URLs", err);
                                return;
                            }

                            let urls = [];
                            if (delimiter === 'newline') {
                                urls = contents.replace(/\r\n/g, "\n").split("\n");
                            } else if (delimiter === "comma") {
                                urls = contents.split(",");
                            } else if (delimiter === "space") {
                                urls = contents.split(" ");
                            }

                            if (urls != null) {
                                chatModerationService.addAllowedUrls(urls);
                            }
                        }
                    });
                };

                $ctrl.deleteAllUrls = function() {
                    utilityService.showConfirmationModal({
                        title: "すべての許可されたURLを削除する",
                        question: `許可されたURLをすべて削除してもよろしいですか？`,
                        confirmLabel: "削除する",
                        confirmBtnType: "btn-danger"
                    }).then(confirmed => {
                        if (confirmed) {
                            chatModerationService.removeAllAllowedUrls();
                        }
                    });
                };
            }
        });
}());
