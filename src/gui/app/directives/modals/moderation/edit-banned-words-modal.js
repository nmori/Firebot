"use strict";

(function() {
    angular.module("firebotApp")
        .component("editBannedWordsModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">禁止語を編集</h4>
            </div>
            <div class="modal-body">
                <p class="muted" style="margin-bottom:20px;">ここに登録された語句を含むメッセージは自動的に削除されます。</p>
                <div style="margin: 0 0 25px;display: flex;flex-direction: row;">

                    <div class="dropdown">
                        <button class="btn btn-primary dropdown-toggle" type="button" id="add-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            <span class="dropdown-text"><i class="fas fa-plus-circle"></i> 禁止語を追加</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="add-options">
                            <li role="menuitem" ng-click="$ctrl.addWord()"><a href style="padding-left: 10px;"><i class="fad fa-plus-circle" style="margin-right: 5px;"></i> 語句を1件追加</a></li>
                            <li role="menuitem" ng-click="$ctrl.showImportModal()"><a href style="padding-left: 10px;"><i class="fad fa-file-import" style="margin-right: 5px;"></i> .txtファイルからインポート <tooltip text="'.txtファイルから語句一覧をインポートします'"></tooltip></a></li>
                        </ul>
                    </div>
                    <div>
                        <button class="btn btn-primary" type="button" id="add-options" ng-click="$ctrl.addRegex()" style="margin-left: 5px;">
                            <span class="dropdown-text"><i class="fas fa-plus-circle"></i> 正規表現を追加</span> <tooltip text="'正規表現はJavaScript形式です。'" />
                        </button>
                    </div>

                    <div style="display: flex;flex-direction: row;justify-content: space-between;margin-left: auto;">
                        <searchbar placeholder-text="語句を検索..." query="$ctrl.search" style="flex-basis: 250px;"></searchbar>
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
                        no-data-message="正規表現はまだ保存されていません。">
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
                        no-data-message="禁止語やフレーズはまだ保存されていません。">
                    </sortable-table>
                </div>
            </div>
            <div class="modal-footer">
                <button ng-show="$ctrl.cms.chatModerationData.bannedWords.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllWords()">禁止語をすべて削除</button>
                <button ng-show="$ctrl.cms.chatModerationData.bannedRegularExpressions.length > 0" type="button" class="btn btn-danger pull-left" ng-click="$ctrl.deleteAllRegex()">正規表現をすべて削除</button>
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
                        name: "正規表現",
                        icon: "fa-code",
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
                                chatModerationService.removeRegex($scope.data.text);
                            };
                        }
                    }
                ];

                $ctrl.wordHeaders = [
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
                                chatModerationService.removeBannedWordByText($scope.data.text);
                            };
                        }
                    }
                ];

                $ctrl.addRegex = () => {
                    utilityService.openGetInputModal(
                        {
                            model: "",
                            label: "正規表現を追加",
                            saveText: "追加",
                            inputPlaceholder: "正規表現を入力",
                            descriptionText: `正規表現は<a href="https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_expressions">JavaScript形式</a>です。`,
                            validationFn: (value) => {
                                return new Promise((resolve) => {
                                    if (value == null || value.trim().length < 1) {
                                        return resolve({
                                            success: false,
                                            reason: `正規表現は空にできません。`
                                        });
                                    }
                                    if (chatModerationService.chatModerationData.bannedRegularExpressions
                                        .some(regex => regex.text === value)) {
                                        return resolve({
                                            success: false,
                                            reason: `この正規表現は既に存在します。`
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
                            label: "禁止語を追加",
                            saveText: "追加",
                            inputPlaceholder: "禁止語またはフレーズを入力",
                            validationFn: (value) => {
                                return new Promise((resolve) => {
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
                            validationText: "禁止語は空にできず、既存値と重複できません。"

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
                        closeCallback: async (data) => {
                            const success = await chatModerationService.importBannedWords(data);

                            if (!success) {
                                utilityService.showErrorModal("禁止語リストのインポート中にエラーが発生しました。詳細はログを確認してください。");
                            }

                            return success;
                        }
                    });
                };

                $ctrl.deleteAllWords = function() {
                    utilityService.showConfirmationModal({
                        title: "禁止語をすべて削除",
                        question: `禁止語とフレーズをすべて削除してもよろしいですか？`,
                        confirmLabel: "削除",
                        confirmBtnType: "btn-danger"
                    }).then((confirmed) => {
                        if (confirmed) {
                            chatModerationService.removeAllBannedWords();
                        }
                    });
                };

                $ctrl.deleteAllRegex = function() {
                    utilityService.showConfirmationModal({
                        title: "正規表現をすべて削除",
                        question: `正規表現をすべて削除してもよろしいですか？`,
                        confirmLabel: "削除",
                        confirmBtnType: "btn-danger"
                    }).then((confirmed) => {
                        if (confirmed) {
                            chatModerationService.removeAllBannedRegularExpressions();
                        }
                    });
                };
            }
        });
}());