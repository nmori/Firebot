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
                <label for="trigger" class="form-label"><i class="fad fa-exclamation"></i> �N���R�}���h <tooltip styles="opacity:0.7;font-size:11px;" text="'�N������`���b�g���b�Z�[�W�̐擪�ɂ���e�L�X�g�B�ʏ�́A!�Ȃǂ̓��ꕶ���Ŏn�܂�܂��B'"/></label>
                <input type="text" class="form-control input-lg" id="trigger" placeholder="!something �̂悤�� !����n�܂�t���[�Y" ng-model="$ctrl.command.trigger" />
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-stopwatch"></i> �Ď��s�҂� <tooltip styles="opacity:0.7;font-size:11px;" text="'�R�}���h���X�p�����M�����̂�h���܂��B�S�̂ɓK�p���邱�Ƃ��A���[�U�[���ƂɓK�p���邱�Ƃ��ł��܂��B'"/></label>
                <command-cooldown-settings command="$ctrl.command" message-setting-disabled="true"></command-cooldown-settings>
                <p class="help-block">�C��</p>
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-lock-alt"></i> ���� <tooltip styles="opacity:0.7;font-size:11px;" text="'�������g�p����ƁA���̃R�}���h���N���ł���l�𐧌��ł��܂��B'" /></label>
                <div>
                    <div class="btn-group">
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'everyone'">�S��</label>
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'subs'">�T�u�X�N���C�o�[����</label>
                        <label class="btn btn-default btn-lg" ng-model="$ctrl.selectedPermissionType" ng-change="$ctrl.permissionTypeChanged()" uib-btn-radio="'mods'">���f���[�^����</label>
                    </div>
                </div>
                <p class="help-block">{{$ctrl.getPermissionText()}}</p>
            </div>

            <div class="form-group">
                <label class="form-label"><i class="fad fa-reply"></i> �ԓ�����e�L�X�g<tooltip styles="opacity:0.7;font-size:11px;" text="'This is what Firebot should say in response when this command is triggered.'" /></label>
                <textarea ng-model="$ctrl.chatEffect.message" class="form-control" style="font-size: 17px;" name="text" placeholder="���b�Z�[�W������" rows="4" cols="40" replace-variables></textarea>
                <p class="help-block">���b�Z�[�W�����ȊO���������ł���? Firebot �̉��o�V�X�e�����ő���Ɋ��p����ɂ́A<b>���p���[�h</b> �ɐ؂�ւ��Ă��������B</p>
            </div>
        </div>
       `,
        controller: function() {
            const $ctrl = this;

            $ctrl.selectedPermissionType = "everyone";

            $ctrl.getPermissionText = () => {
                switch ($ctrl.selectedPermissionType) {
                case "everyone":
                    return "�S�������̃R�}���h���N���ł��܂��B";
                case "subs":
                    return "�T�u�X�N���C�o�[�ƃ��f���[�^�����̃R�}���h���N���ł��܂�";
                case "mods":
                    return "���f���[�^���������̃R�}���h���N���ł��܂�";
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