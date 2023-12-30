"use strict";
(function() {
    const uuid = require("uuid/v4");
    angular.module("firebotApp").component("simpleCommandOptions", {
        bindings: {
            command: "="
        },
        template: `
        <div class="simple-command p-4">
            <div class="form-group">
                <label for="trigger" class="form-label"><i class="fad fa-exclamation"></i> 起動コマンド <tooltip styles="opacity:0.7;font-size:11px;" text="'起動するチャットメッセージの先頭につけるテキスト。通常は、!などの特殊文字で始まります。'"/></label>
                <input type="text" class="form-control input-lg" id="trigger" placeholder="!something のような !から始まるフレーズ" ng-model="$ctrl.command.trigger" />
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-stopwatch"></i> 再実行待ち <tooltip styles="opacity:0.7;font-size:11px;" text="'コマンドがスパム送信されるのを防ぎます。全体に適用することも、ユーザーごとに適用することもできます。'"/></label>
                <command-cooldown-settings command="$ctrl.command" message-setting-disabled="true"></command-cooldown-settings>
                <p class="help-block">任意</p>
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-lock-alt"></i> 権限 <tooltip styles="opacity:0.7;font-size:11px;" text="'権限を使用すると、このコマンドを起動できる人を制限できます。'" /></label>
                <div>
                    <div class="btn-group">
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'everyone'">全員</label>
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'subs'">サブスクライバー限定</label>
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'mods'">モデレータ限定</label>
                    </div>
                </div>
                <p class="help-block">{{$ctrl.getPermissionText()}}</p>
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-reply"></i> 返答するテキスト<tooltip styles="opacity:0.7;font-size:11px;" text="'This is what Firebot should say in response when this command is triggered.'" /></label>
                <textarea ng-model="$ctrl.chatEffect.message" class="form-control" style="font-size: 17px;" name="text" placeholder="メッセージを入れる" rows="4" cols="40" replace-variables></textarea>
                <p class="help-block">メッセージ応答以外をしたいですか? Firebot の演出システムを最大限に活用するには、<b>応用モード</b> に切り替えてください。</p>
            </div>
        </div>
       `,
        controller: function() {
            const $ctrl = this;

            $ctrl.selectedPermissionType = "everyone";

            $ctrl.getPermissionText = () => {
                switch ($ctrl.selectedPermissionType) {
                case "everyone":
                    return "全員がこのコマンドを起動できます。";
                case "subs":
                    return "サブスクライバーとモデレータがこのコマンドを起動できます";
                case "mods":
                    return "モデレータだけがこのコマンドを起動できます";
                }
            };

            $ctrl.permissionTypeChanged = () => {
                switch ($ctrl.selectedPermissionType) {
                    case "everyone":
                        $ctrl.command.restrictionData.restrictions = [];
                        break;
                    case "subs":
                        $ctrl.command.restrictionData.restrictions = [{
                            id: uuid(),
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: ["sub", "mod", "broadcaster"]
                        }];
                        break;
                    case "mods":
                        $ctrl.command.restrictionData.restrictions = [{
                            id: uuid(),
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
                            id: uuid(),
                            type: "firebot:chat",
                            message: chatEffect.message
                        };
                    }
                }
                if ($ctrl.chatEffect == null) {
                    $ctrl.chatEffect = {
                        id: uuid(),
                        type: "firebot:chat",
                        message: ""
                    };
                }
                $ctrl.command.effects.list = [$ctrl.chatEffect];
            };
        }
    });
}());