"use strict";

(function() {
    const { randomUUID } = require("crypto");
    angular.module("firebotApp")
        .component("addOrEditSubcommandModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">{{$ctrl.isNewArg ? '追加' : '編集'}} サブコマンド</h4>
            </div>
            <div class="modal-body">
                <div>
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        引数タイプ
                    </div>
                    <div ng-class="{'has-error': $ctrl.kindError}">
                        <firebot-searchable-select
                            ng-model="$ctrl.arg.type"
                            ng-change="$ctrl.onTypeChange()"
                            items="$ctrl.argTypes"
                            item-id="type"
                            item-name="displayName"
                            placeholder="引数タイプを選択"
                        />
                        <div id="helpBlock2" class="help-block" ng-show="$ctrl.kindError">{{$ctrl.kindErrorText}}</div>
                    </div>
                </div>

                <div ng-show="$ctrl.arg.type === 'Custom'" style="margin-top: 15px;">
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        引数トリガーテキスト <tooltip text="'このサブコマンドを発火させるテキストです'">
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.nameError}" style="margin-bottom: 0;">
                            <input type="text" id="nameField" class="form-control" ng-model="$ctrl.arg.arg" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="helpBlock" placeholder="トリガーテキストを入力" ng-keydown="$event.keyCode != 32 ? $event:$event.preventDefault()">
                            <span id="helpBlock" class="help-block" ng-show="$ctrl.nameError">{{$ctrl.nameErrorText}}</span>
                        </div>
                    </div>
                </div>

                <p class="muted mt-3" ng-if="$ctrl.arg.type && ($ctrl.arg.type === 'Custom' ? $ctrl.arg.arg : true)">
                   使用例: {{$ctrl.parentTrigger || "!command"}} <b>{{$ctrl.getExampleText()}}</b>
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-link" ng-click="$ctrl.dismiss()">キャンセル</button>
                <button type="button" class="btn btn-primary" ng-click="$ctrl.save()">{{$ctrl.isNewArg ? '追加' : '保存'}}</button>
            </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: function($timeout) {
                const $ctrl = this;

                $ctrl.kindErrorText = "";
                $ctrl.nameErrorText = 'トリガーテキストを入力してください。';

                $ctrl.kindError = false;
                $ctrl.nameError = false;

                $timeout(() => {
                    angular.element("#nameField").trigger("focus");
                }, 50);

                $ctrl.arg = {
                    active: true,
                    id: randomUUID(),
                    type: "Custom",
                    arg: "",
                    regex: false
                };

                $ctrl.parentTrigger = undefined;

                $ctrl.onTypeChange = () => {
                    $ctrl.arg.usage = null;
                    $ctrl.arg.arg = null;
                    $ctrl.kindError = false;
                };

                $ctrl.argTypes = [
                    {
                        type: "Custom",
                        displayName: "カスタム",
                        description: "特定のテキストで発火する引数"
                    }
                ];

                function validateArgTriggerText() {
                    if ($ctrl.arg.type !== "Custom") {
                        return true;
                    }

                    const triggerText = $ctrl.arg.arg;
                    if (triggerText == null || triggerText.length < 1) {
                        $ctrl.nameErrorText = 'トリガーテキストを入力してください。';
                        return false;
                    }
                    if ($ctrl.resolve.otherArgNames.some(a => a === triggerText.toLowerCase())) {
                        $ctrl.nameErrorText = 'このトリガーテキストは既に存在します。';
                        return false;
                    }
                    return true;
                }

                function validateArgType() {
                    const type = $ctrl.arg.type;

                    if (type == null || !type.length) {
                        $ctrl.kindErrorText = "引数タイプを選択してください。";
                        return false;
                    } else if (type === "Fallback" && !$ctrl.resolve.hasAnyArgs) {
                        $ctrl.kindErrorText = "フォールバックを追加する前に、別の引数タイプを追加してください。";
                        return false;
                    }

                    $ctrl.kindErrorText = "";
                    return true;
                }

                $ctrl.getExampleText = () => {
                    if ($ctrl.arg.type === "Custom") {
                        return $ctrl.arg.arg ?? "subcommand";
                    } else if ($ctrl.arg.type === "Number") {
                        return "42";
                    } else if ($ctrl.arg.type === "Username") {
                        return "@user";
                    } else if ($ctrl.arg.type === "Fallback") {
                        return "any other text";
                    }
                    return "";
                };

                const numberRegex = "\\d+";
                const usernameRegex = "@\\w+";

                $ctrl.save = function() {

                    $ctrl.nameError = false;
                    $ctrl.kindError = false;


                    if (!validateArgType()) {
                        $ctrl.kindError = true;
                    }

                    if ($ctrl.arg.arg != null) {
                        $ctrl.arg.arg = $ctrl.arg.arg.trim().toLowerCase().replace(/ /g, "");
                    }

                    if (!validateArgTriggerText()) {
                        $ctrl.nameError = true;
                    }

                    if ($ctrl.nameError || $ctrl.kindError) {
                        return;
                    }

                    $ctrl.arg.regex = false;
                    $ctrl.arg.fallback = false;
                    if ($ctrl.arg.type === "Number") {
                        $ctrl.arg.regex = true;
                        $ctrl.arg.usage = "[number]";
                        $ctrl.arg.arg = numberRegex;
                    } else if ($ctrl.arg.type === "Username") {
                        $ctrl.arg.regex = true;
                        $ctrl.arg.usage = "@username";
                        $ctrl.arg.arg = usernameRegex;
                    } else if ($ctrl.arg.type === "Fallback") {
                        $ctrl.arg.fallback = true;
                        $ctrl.arg.regex = true;
                        $ctrl.arg.id = "fallback-subcommand";
                        $ctrl.arg.usage = "[anything]";
                        $ctrl.arg.arg = ".+";
                    }

                    $ctrl.close({
                        $value: $ctrl.arg
                    });
                };

                $ctrl.isNewArg = true;

                $ctrl.$onInit = function() {
                    if (!$ctrl.resolve.hasNumberArg ||
                        ($ctrl.resolve.arg && $ctrl.resolve.arg.arg === numberRegex)) {
                        $ctrl.argTypes.push({
                            type: "Number",
                            displayName: "数値",
                            description: "任意の数値で発火する引数"
                        });
                    }

                    if (!$ctrl.resolve.hasUsernameArg ||
                        ($ctrl.resolve.arg && $ctrl.resolve.arg.arg === usernameRegex)) {
                        $ctrl.argTypes.push({
                            type: "Username",
                            displayName: "ユーザー名",
                            description: "@で始まるテキストで発火する引数"
                        });
                    }

                    if (!$ctrl.resolve.hasFallbackArg ||
                        ($ctrl.resolve.arg && $ctrl.resolve.arg.fallback)) {
                        $ctrl.argTypes.push({
                            type: "Fallback",
                            displayName: "フォールバック",
                            description: "他の引数が一致しない場合に発火する引数"
                        });
                    }

                    if ($ctrl.resolve.arg) {
                        $ctrl.arg = JSON.parse(angular.toJson($ctrl.resolve.arg));
                        $ctrl.isNewArg = false;
                    }

                    $ctrl.parentTrigger = $ctrl.resolve.parentTrigger;
                };
            }
        });
}());
