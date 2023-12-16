"use strict";

// Basic template for a modal component, copy this and rename to build a modal.

(function() {

    const fs = require("fs");

    angular.module("firebotApp")
        .component("editBannedWordsModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">禁止用語の編集</h4>
            </div>
            <div class="modal-body">
                <p class="muted" style="margin-bottom:20px;">ここに記載されている語句を含むメッセージは自動的に削除されます。.</p>
                <div style="margin: 0 0 25px;display: flex;flex-direction: row;">

                    <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" id="add-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            <span class="dropdown-text"><i class="fas fa-plus-circle"></i> 禁止ワードの追加</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="add-options">
                            <li role="menuitem" ng-click="$ctrl.addWord()"><a href style="padding-left: 10px;"><i class="fad fa-plus-circle" style="margin-right: 5px;"></i> 追加</a></li>
                            <li role="menuitem" ng-click="$ctrl.showImportModal()"><a href style="padding-left: 10px;"><i class="fad fa-file-import" style="margin-right: 5px;"></i> テキストファイルから取り込み <tooltip text="'txtファイルから単語/フレーズのリストをインポートする。"></tooltip></a></li>
                        </ul>
                    </div>
                    <div>
                        <button class="btn btn-primary" type="button" id="add-options" ng-click="$ctrl.addRegex()" style="margin-left: 5px;">
                            <span class="dropdown-text"><i class="fas fa-plus-circle"></i> 正規表現の追加</span>
                        </button>
                    </div>

                    <div style="display: flex;flex-direction: row;justify-content: space-between;margin-left: auto;">
                        <searchbar placeholder-text="検索..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <sortable-table
                        table-data-set="$ctrl.cms.chatModerationData.bannedRegularExpressions"
                        headers="$ctrl.regexHeaders"
                        query="$ctrl.search"
                        clickable="false"
                        starting-sort-field="createdAt"
                        sort-initially-reversed="true"
                        page-size="5"
                        no-data-message="正規表現が保存されていない.">
                    </sortable-table>
                </div>
                <div>
                    <sortable-table
                        table-data-set="$ctrl.cms.chatModerationData.bannedWords"
                        headers="$ctrl.wordHeaders"
                        query="$ctrl.search"
                        clickable="false"
                        starting-sort-field="createdAt"
                        sort-initially-reversed="true"
                        page-size="5"
                        no-data-message="禁止語句が保存されていない.">
                    </sortable-table>
                </div>
            </div>
            <div class="modal-footer">
                <button ng-show="$ctrl.cms.chatModerationData.bannedWords.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllWords()">禁止ワードを全削除</button>
                <button ng-show="$ctrl.cms.chatModerationData.bannedRegularExpressions.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllRegex()">正規表現を全削除</button>
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

                $ctrl.regexHeaders = [
                    {
                        name: "REGEX",
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
                        cellTemplate: `<i class="fal fa-trash-alt clickable" style="color:#ff3737;" ng-click="clicked()" uib-tooltip="削除する" tooltip-append-to-body="true"></i>`,
                        cellController: ($scope, chatModerationService) => {
                            $scope.clicked = () => {
                                chatModerationService.removeRegex($scope.data.text);
                            };
                        }
                    }
                ];

                $ctrl.wordHeaders = [
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
                        cellTemplate: `<i class="fal fa-trash-alt clickable" style="color:#ff3737;" ng-click="clicked()" uib-tooltip="削除する" tooltip-append-to-body="true"></i>`,
                        cellController: ($scope, chatModerationService) => {
                            $scope.clicked = () => {
                                chatModerationService.removeBannedWordByText($scope.data.text);
                            };
                        }
                    }
                ];

                $ctrl.addRegex = () => {
                    utilityService.openGetInputModal(
                        {
                            model: "",
                            label: "正規表現の追加",
                            saveText: "追加",
                            inputPlaceholder: "正規表現を入力",
                            validationFn: (value) => {
                                return new Promise(resolve => {
                                    if (value == null || value.trim().length < 1) {
                                        return resolve({
                                            success: false,
                                            reason: `正規表現を入力してください`
                                        });
                                    }
                                    if (chatModerationService.chatModerationData.bannedRegularExpressions
                                        .some(regex => regex.text === value)) {
                                        return resolve({
                                            success: false,
                                            reason: `正規表現はすでに存在する。`
                                        });
                                    }
                                    try {
                                        new RegExp(value, "gi");
                                    } catch (error) {
                                        logger.warn(`Invalid RegEx entered: ${value}`, error);
                                        return resolve({
                                            success: false,
                                            reason: `有効な正規表現を入力してください。`
                                        });
                                    }
                                    resolve(true);
                                });
                            }
                        },
                        (newRegex) => {
                            chatModerationService.addBannedRegex(newRegex.trim());
                        });
                };

                $ctrl.addWord = () => {
                    utilityService.openGetInputModal(
                        {
                            model: "",
                            label: "禁止ワードの追加",
                            saveText: "追加",
                            inputPlaceholder: "禁止語句の入力",
                            validationFn: (value) => {
                                return new Promise(resolve => {
                                    if (value == null || value.trim().length < 1 || value.trim().length > 359) {
                                        resolve(false);
                                    } else if (chatModerationService.chatModerationData.bannedWords
                                        .some(w => w.text === value.toLowerCase())) {
                                        resolve(false);
                                    } else {
                                        resolve(true);
                                    }
                                });
                            },
                            validationText: "禁止されている単語が空、もしくはすでに存在しています。"

                        },
                        (newWord) => {
                            chatModerationService.addBannedWords([newWord.trim()]);
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
                                logger.error("error reading file for banned words", err);
                                return;
                            }

                            let words = [];
                            if (delimiter === 'newline') {
                                words = contents.replace(/\r\n/g, "\n").split("\n");
                            } else if (delimiter === "comma") {
                                words = contents.split(",");
                            } else if (delimiter === "space") {
                                words = contents.split(" ");
                            }

                            if (words != null) {
                                chatModerationService.addBannedWords(words);
                            }
                        }
                    });
                };

                $ctrl.deleteAllWords = function() {
                    utilityService.showConfirmationModal({
                        title: "全ワードを削除",
                        question: `禁止語句をすべて削除してもよろしいですか？`,
                        confirmLabel: "削除する",
                        confirmBtnType: "btn-danger"
                    }).then(confirmed => {
                        if (confirmed) {
                            chatModerationService.removeAllBannedWords();
                        }
                    });
                };

                $ctrl.deleteAllRegex = function() {
                    utilityService.showConfirmationModal({
                        title: "すべての正規表現を削除する",
                        question: `本当にすべての正規表現を削除しますか？`,
                        confirmLabel: "削除する",
                        confirmBtnType: "btn-danger"
                    }).then(confirmed => {
                        if (confirmed) {
                            chatModerationService.removeAllBannedRegularExpressions();
                        }
                    });
                };
            }
        });
}());
