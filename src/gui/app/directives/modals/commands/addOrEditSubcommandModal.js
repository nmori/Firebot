"use strict";

(function() {
    const uuid = require("uuid/v4");
    angular.module("firebotApp")
        .component("addOrEditSubcommandModal", {
            template: `
            <div class="modal-header">
                <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                <h4 class="modal-title">{{$ctrl.isNewArg ? 'Add' : 'Edit'}} サブコマンド</h4>
            </div>
            <div class="modal-body">
                <div>
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        引数の種類
                    </div>
                    <div ng-class="{'has-error': $ctrl.kindError}">
                        <ui-select ng-model="$ctrl.arg.type" ng-change="$ctrl.onTypeChange()" theme="bootstrap" class="control-type-list">
                            <ui-select-match placeholder="引数の種類を選ぶ">{{$select.selected.type}}</ui-select-match>
                            <ui-select-choices repeat="arg.type as arg in $ctrl.argTypes | filter: { type: $select.search }" style="position:relative;">
                                <div style="padding: 5px;">
                                    <div ng-bind-html="arg.type | highlight: $select.search"></div>
                                    <small class="muted">{{arg.description}}</small>
                                </div>
                            </ui-select-choices>
                        </ui-select>
                        <div id="helpBlock2" class="help-block" ng-show="$ctrl.kindError">引数のタイプを選択してください.</div>
                    </div>
                </div>

                <div ng-show="$ctrl.arg.type === 'Custom'" style="margin-top: 15px;">
                    <div class="modal-subheader" style="padding: 0 0 4px 0">
                        Arg Trigger Text <tooltip text="'このサブコマンドを起動するテキスト'">
                    </div>
                    <div style="width: 100%; position: relative;">
                        <div class="form-group" ng-class="{'has-error': $ctrl.nameError}">
                            <input type="text" id="nameField" class="form-control" ng-model="$ctrl.arg.arg" ng-keyup="$event.keyCode == 13 && $ctrl.save() " aria-describedby="helpBlock" placeholder="Enter trigger text" ng-keydown="$event.keyCode != 32 ? $event:$event.preventDefault()">
                            <span id="helpBlock" class="help-block" ng-show="$ctrl.nameError">{{$ctrl.nameErrorText}}</span>
                        </div>
                    </div>
                </div>
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

                $ctrl.nameErrorText = '起動用テキストを入力してください.';

                $timeout(() => {
                    angular.element("#nameField").trigger("focus");
                }, 50);

                $ctrl.arg = {
                    active: true,
                    id: uuid(),
                    type: "Custom",
                    arg: "",
                    regex: false
                };

                $ctrl.onTypeChange = () => {
                    $ctrl.arg.usage = null;
                    $ctrl.arg.arg = null;
                };

                $ctrl.nameError = false;
                $ctrl.kindError = false;

                $ctrl.argTypes = [
                    {
                        type: "Custom",
                        description: "特定のテキストで起動される引数"
                    }
                ];

                function validateArgTriggerText() {
                    if ($ctrl.arg.type !== "Custom") {
                        return true;
                    }

                    const triggerText = $ctrl.arg.arg;
                    if (triggerText == null || triggerText.length < 1) {
                        $ctrl.nameErrorText = '起動用テキストを入力してください';
                        return false;
                    }
                    if ($ctrl.resolve.otherArgNames.some(a => a === triggerText.toLowerCase())) {
                        $ctrl.nameErrorText = 'この起動用テキストはすでに存在します.';
                        return false;
                    }
                    return true;
                }

                function validateArgType() {
                    const type = $ctrl.arg.type;
                    return type != null && type.length > 0;
                }

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
                            description: "任意の起動をしたい数字"
                        });
                    }

                    if (!$ctrl.resolve.hasUsernameArg ||
                        ($ctrl.resolve.arg && $ctrl.resolve.arg.arg === usernameRegex)) {
                        $ctrl.argTypes.push({
                            type: "Username",
                            description: "@で始まる起動にしたいユーザ名、テキスト"
                        });
                    }

                    if (!$ctrl.resolve.hasFallbackArg ||
                        ($ctrl.resolve.arg && $ctrl.resolve.arg.fallback)) {
                        $ctrl.argTypes.push({
                            type: "Fallback",
                            description: "他の引数がどれも一致しない場合に起動される引数"
                        });
                    }

                    if ($ctrl.resolve.arg) {
                        $ctrl.arg = JSON.parse(angular.toJson($ctrl.resolve.arg));
                        $ctrl.isNewArg = false;
                    }
                };
            }
        });
}());
