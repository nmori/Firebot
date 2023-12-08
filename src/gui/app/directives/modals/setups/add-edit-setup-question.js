"use strict";

(function() {
    const uuid = require("uuid/v4");
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
                    
                    <h3>置換タグ <tooltip text="'Firebotは、タグをユーザーの返答に置換します。タグは何でもかまいませんが、一般的でない文字を使用することをお勧めします。 例： %WagerAmount%'"/></h3>
                    <input type="text" class="form-control" ng-model="$ctrl.question.replaceToken" placeholder="テキストを入力" />

                    <h3>ヒント<tooltip text="'これはツールチップに表示される追加テキストです。（任意）'"/></h3>
                    <textarea type="text" class="form-control" rows="3" ng-model="$ctrl.question.helpText" placeholder="任意"></textarea>

                    <h3>回答の種類</h3>
                    <select 
                        class="fb-select" 
                        ng-model="$ctrl.question.answerType"
                        ng-change="$ctrl.question.defaultAnswer = undefined"; 
                        ng-options="answerType.id as answerType.name for answerType in $ctrl.answerTypes">
                        <option value="" disabled selected>返答の種類を選択...</option>
                    </select>

                    <h3>回答の初期値 <tooltip text="'これは、回答テキストフィールドに初期設定されるデフォルトの回答です。 (任意).'"/></h3>
                    <input type="{{$ctrl.question.answerType}}" class="form-control" ng-model="$ctrl.question.defaultAnswer" placeholder="任意" />
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
                    }
                ];

                $ctrl.question = {
                    id: uuid(),
                    question: undefined,
                    helpText: undefined,
                    defaultAnswer: undefined,
                    answerType: "text",
                    replaceToken: undefined
                };

                $ctrl.$onInit = () => {
                    if ($ctrl.resolve.question) {
                        $ctrl.question = JSON.parse(angular.toJson($ctrl.resolve.question));
                        if ($ctrl.question.answerType == null) {
                            $ctrl.question.answerType = "text";
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

                    $ctrl.close({
                        $value: $ctrl.question
                    });
                };
            }
        });
}());
