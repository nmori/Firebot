"use strict";

(function() {
    const { randomUUID } = require("crypto");
    angular.module("firebotApp")
        .component("addOrEditSetupQuestion", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">{{$ctrl.isNewQuestion ? '追加' : '編集'}} セットアップのインポート質問</h4>
                </div>
                <div class="modal-body">
                    <h5>質問 <tooltip text="'ユーザーがインポート時に回答する質問です。例: デフォルトの賭け金はいくらにしますか？'"/></h5>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.question.question" placeholder="質問を入力"></textarea>

                    <h5>置換トークン <tooltip text="'Firebot はこのトークンを、ユーザーがこの質問に入力した回答に置換します。トークンは任意ですが、重複しにくい文字列がおすすめです。例: %WagerAmount%'"/></h5>
                    <input type="text" class="form-control" ng-model="$ctrl.question.replaceToken" placeholder="テキストを入力" />

                    <h5>ツールチップテキスト <tooltip text="'ツールチップに表示する補足テキストです（このように表示されます）。任意です。'"/></h5>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.question.helpText" placeholder="任意"></textarea>

                    <h5>回答タイプ</h5>
                    <select
                        class="fb-select"
                        ng-model="$ctrl.question.answerType"
                        ng-change="$ctrl.question.defaultAnswer = undefined";
                        ng-options="answerType.id as answerType.name for answerType in $ctrl.answerTypes">
                        <option value="" disabled selected>回答タイプを選択...</option>
                    </select>

                    <div ng-if="$ctrl.question.answerType === 'preset'">
                        <h5>プリセット選択肢 <tooltip text="'ユーザーにドロップダウンとして表示される選択肢です。'"/></h5>
                        <editable-list settings="$ctrl.presetOptionSettings" model="$ctrl.question.presetOptions" />
                    </div>

                    <h5>デフォルト回答 <tooltip text="'回答欄に初期値として設定される回答です。任意です。'"/></h5>
                    <input
                        type="{{$ctrl.question.answerType}}"
                        class="form-control"
                        ng-model="$ctrl.question.defaultAnswer" placeholder="任意"
                        ng-if="$ctrl.question.answerType !== 'preset'"
                    />
                    <select class="fb-select" ng-model="$ctrl.question.defaultAnswer" ng-if="$ctrl.question.answerType === 'preset'">
                        <option label="未設定" value="">未設定</option>
                        <option ng-repeat="preset in $ctrl.question.presetOptions" label="{{preset}}" value="{{preset}}">{{preset}}</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">保存</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function(ngToast) {
                const $ctrl = this;

                $ctrl.isNewQuestion = true;

                $ctrl.answerTypes = [
                    {
                        id: "text",
                        name: "テキスト"
                    }, {
                        id: "number",
                        name: "数値"
                    },
                    {
                        id: "preset",
                        name: "プリセット選択肢"
                    }
                ];

                $ctrl.presetOptionSettings = {
                    addLabel: "選択肢を追加",
                    editLabel: "選択肢を編集",
                    inputPlaceholder: "選択肢を入力",
                    noneAddedText: "選択肢が追加されていません",
                    noDuplicates: true,
                    sortable: true
                };

                $ctrl.question = {
                    id: randomUUID(),
                    question: undefined,
                    helpText: undefined,
                    defaultAnswer: undefined,
                    answerType: "text",
                    replaceToken: undefined,
                    presetOptions: []
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.question) {
                        $ctrl.question = JSON.parse(angular.toJson($ctrl.resolve.question));
                        if ($ctrl.question.answerType == null) {
                            $ctrl.question.answerType = "text";
                        }
                        if ($ctrl.question.presetOptions == null) {
                            $ctrl.question.presetOptions = [];
                        }
                        $ctrl.isNewQuestion = false;
                    }
                };

                $ctrl.save = () => {
                    if ($ctrl.question.question == null || $ctrl.question.question === "") {
                        ngToast.create("質問を入力してください");
                        return;
                    }

                    if ($ctrl.question.replaceToken == null || $ctrl.question.replaceToken === "") {
                        ngToast.create("置換トークンを入力してください");
                        return;
                    }

                    if ($ctrl.question.answerType === "preset" && !$ctrl.question.presetOptions?.length) {
                        ngToast.create("少なくとも1つのプリセット選択肢を追加してください");
                        return;
                    }

                    $ctrl.close({
                        $value: $ctrl.question
                    });
                };
            }
        });
}());
