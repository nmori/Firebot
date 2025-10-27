"use strict";

(function() {
    const { v4: uuid } = require("uuid");
    angular.module("firebotApp")
        .component("addOrEditSetupQuestion", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">セットアップ・インポートに関する質問の{{$ctrl.isNewQuestion ? '追加' : '編集'}} </h4>
                </div>
                <div class="modal-body">
                    <h3>質問 <tooltip text="'これはユーザーがインポートする際に尋ねられる質問です'"/></h3>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.question.question" placeholder="質問を入れてください"></textarea>

                    <h5>置換タグ <tooltip text="'Firebotは、タグをユーザーの返答に置換します。タグは何でもかまいませんが、一般的でない文字を使用することをお勧めします。 例： %WagerAmount%'"/></h5>
                    <input type="text" class="form-control" ng-model="$ctrl.question.replaceToken" placeholder="テキストを入力" />

                    <h5>ヒント<tooltip text="'これはツールチップに表示される追加テキストです。（任意）'"/></h5>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.question.helpText" placeholder="任意"></textarea>

                    <h5>回答の種類</h5>
                    <select
                        class="fb-select"
                        ng-model="$ctrl.question.answerType"
                        ng-change="$ctrl.question.defaultAnswer = undefined";
                        ng-options="answerType.id as answerType.name for answerType in $ctrl.answerTypes">
                        <option value="" disabled selected>返答の種類を選択...</option>
                    </select>

                    <div ng-if="$ctrl.question.answerType === 'preset'">
                        <h5>回答の初期値 <tooltip text="'これは、回答テキストフィールドに初期設定されるデフォルトの回答です。 (任意)'"/></h5>
                        <editable-list settings="$ctrl.presetOptionSettings" model="$ctrl.question.presetOptions" />
                </div>

                    <h5>Default Answer <tooltip text="'This is a default answer that will be initially set in the answer field. Optional.'"/></h5>
                    <input
                        type="{{$ctrl.question.answerType}}"
                        class="form-control"
                        ng-model="$ctrl.question.defaultAnswer" placeholder="Optional"
                        ng-if="$ctrl.question.answerType !== 'preset'"
                    />
                    <select class="fb-select" ng-model="$ctrl.question.defaultAnswer" ng-if="$ctrl.question.answerType === 'preset'">
                        <option label="Not set" value="">Not set</option>
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
                        name: "Preset Options"
                    }
                ];

                $ctrl.presetOptionSettings = {
                    addLabel: "Add Option",
                    editLabel: "Edit Option",
                    inputPlaceholder: "Enter Option",
                    noneAddedText: "No options added",
                    noDuplicates: true,
                    sortable: true
                };

                $ctrl.question = {
                    id: uuid(),
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
                        ngToast.create("質問も入力してください");
                        return;
                    }

                    if ($ctrl.question.replaceToken == null || $ctrl.question.replaceToken === "") {
                        ngToast.create("置換トークンも入力してください");
                        return;
                    }

                    if ($ctrl.question.answerType === "preset" && !$ctrl.question.presetOptions?.length) {
                        ngToast.create("Please include at least one preset option");
                        return;
                    }

                    $ctrl.close({
                        $value: $ctrl.question
                    });
                };
            }
        });
}());
