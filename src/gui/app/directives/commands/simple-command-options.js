"use strict";
(function() {
    const { randomUUID } = require("crypto");
    angular.module("firebotApp").component("simpleCommandOptions", {
        bindings: {
            command: "="
        },
        template: `
        <div class="simple-command p-4">
            <div class="form-group">
                <label for="trigger" class="form-label"><i class="fad fa-exclamation"></i> トリガー <tooltip styles="opacity:0.7;font-size:11px;" text="'チャットメッセージの先頭で、このコマンドを発火させる文字列です。通常は ! などの記号で始まります。'"/></label>
                <input type="text" class="form-control input-lg" id="trigger" placeholder="!something" ng-model="$ctrl.command.trigger" />
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-stopwatch"></i> クールダウン <tooltip styles="opacity:0.7;font-size:11px;" text="'クールダウンはコマンドの連投を防ぎます。全体およびユーザーごとに設定できます。'"/></label>
                <command-cooldown-settings command="$ctrl.command" message-setting-disabled="true"></command-cooldown-settings>
                <p class="help-block">任意</p>
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-lock-alt"></i> 権限 <tooltip styles="opacity:0.7;font-size:11px;" text="'権限設定で、このコマンドを実行できるユーザーを制限できます。'" /></label>
                <div>
                    <div class="btn-group">
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'everyone'">全員</label>
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'subs'">サブのみ</label>
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'mods'">モデレーターのみ</label>
                    </div>
                </div>
                <p class="help-block">{{$ctrl.getPermissionText()}}</p>
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-reply"></i> 応答テキスト <tooltip styles="opacity:0.7;font-size:11px;" text="'このコマンドが発火したときに Firebot が返すメッセージです。'" /></label>
                <textarea ng-model="$ctrl.chatEffect.message" class="form-control" style="font-size: 17px;" name="text" placeholder="メッセージを入力" rows="4" cols="40" replace-variables></textarea>
                <p class="help-block">メッセージ応答以上のことをしたい場合は、<b>詳細モード</b>に切り替えて Firebot のエフェクト機能を活用してください。</p>
            </div>
        </div>
       `,
        controller: function() {
            const $ctrl = this;

            $ctrl.selectedPermissionType = "everyone";

            $ctrl.getPermissionText = () => {
                switch ($ctrl.selectedPermissionType) {
                    case "everyone":
                        return "すべての視聴者がこのコマンドを実行できます。";
                    case "subs":
                        return "サブスクライバー（およびモデレーター）のみ実行できます。";
                    case "mods":
                        return "モデレーターと配信者本人のみ実行できます。";
                }
            };

            $ctrl.permissionTypeChanged = () => {
                switch ($ctrl.selectedPermissionType) {
                    case "everyone":
                        $ctrl.command.restrictionData.restrictions = [];
                        break;
                    case "subs":
                        $ctrl.command.restrictionData.restrictions = [{
                            id: randomUUID(),
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: ["sub", "mod", "broadcaster"]
                        }];
                        break;
                    case "mods":
                        $ctrl.command.restrictionData.restrictions = [{
                            id: randomUUID(),
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: ["mod", "broadcaster"]
                        }];
                        break;
                }
            };

            $ctrl.$onInit = () => {
                if ($ctrl.command.restrictionData) {
                    const permissions = $ctrl.command.restrictionData.restrictions
                        .find(r => r.type === "firebot:permissions");
                    if (permissions && permissions.roleIds) {
                        if (permissions.roleIds.length === 2 &&
                            permissions.roleIds.includes("mod") &&
                            permissions.roleIds.includes("broadcaster")) {
                            $ctrl.selectedPermissionType = "mods";
                        }
                        if (permissions.roleIds.length === 3 &&
                            permissions.roleIds.includes("sub") &&
                            permissions.roleIds.includes("mod") &&
                            permissions.roleIds.includes("broadcaster")) {
                            $ctrl.selectedPermissionType = "subs";
                        }
                    }
                }
                $ctrl.permissionTypeChanged();

                if ($ctrl.command.effects && $ctrl.command.effects.list) {
                    const chatEffect = $ctrl.command.effects.list.find(e => e.type === "firebot:chat");
                    if (chatEffect) {
                        $ctrl.chatEffect = {
                            id: randomUUID(),
                            type: "firebot:chat",
                            message: chatEffect.message
                        };
                    }
                }
                if ($ctrl.chatEffect == null) {
                    $ctrl.chatEffect = {
                        id: randomUUID(),
                        type: "firebot:chat",
                        message: ""
                    };
                }
                $ctrl.command.effects.list = [$ctrl.chatEffect];
            };
        }
    });
}());