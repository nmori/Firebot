"use strict";

(function() {
    angular.module("firebotApp").component("sysCommandRow", {
        bindings: {
            command: "<"
        },
        template: `
      <div style="margin-bottom: 20px" context-menu="$ctrl.sysCommandMenuOptions($ctrl.command)">
        <div class="sys-command-row" ng-init="hidePanel = true" ng-click="hidePanel = !hidePanel" ng-class="{'expanded': !hidePanel}">
          <div style="flex-basis: 25%;padding-left: 20px;">{{$ctrl.command.name}}</div>
          <div style="width: 20%">{{$ctrl.command.trigger}}</div>
          <div style="width: 20%">
            <span style="min-width: 51px; display: inline-block;" uib-tooltip="再実行可能になるまでの待ち時間(全般)">
                <i class="far fa-globe-americas"></i> {{$ctrl.command.cooldown.global ? $ctrl.command.cooldown.global + "s" : "-" }}
            </span>
            <span uib-tooltip="再実行可能になるまでの待ち時間(ユーザ)">
                <i class="far fa-user"></i> {{$ctrl.command.cooldown.user ? $ctrl.command.cooldown.user + "s" : "-" }}
            </span>
          </div>
          <div style="width: 20%"><span style="text-transform: capitalize;">{{$ctrl.getPermissionType($ctrl.command)}}</span> <tooltip type="info" text="$ctrl.getPermissionTooltip($ctrl.command)"></tooltip></div>
          <div style="width: 20%">
            <div style="min-width: 75px">
                <span class="status-dot" ng-class="{'active': $ctrl.command.active, 'notactive': !$ctrl.command.active}"></span> {{$ctrl.command.active ? "有効" : "無効"}}
            </div>
          </div>
          <div style="flex-basis:30px; flex-shrink: 0;">
            <i class="fas" ng-class="{'fa-chevron-right': hidePanel, 'fa-chevron-down': !hidePanel}"></i>
          </div>
        </div>
        <div uib-collapse="hidePanel" class="sys-command-expanded">
          <div style="padding: 15px 20px 10px 20px;">
            <div class="muted" style="font-weight:bold; font-size: 12px;">説明</div>
            <p style="font-size: 18px">{{$ctrl.command.description}}</p>
            <div>
              <div class="muted" style="font-weight:bold; font-size: 12px;">使い方</div>
              <p ng-if="!$ctrl.command.subCommands || $ctrl.command.subCommands.length < 1" style="font-size: 15px;font-weight: 600;">{{$ctrl.command.trigger}} {{$ctrl.command.usage ? $ctrl.command.usage : ''}}</p>
            </div>

            <div ng-if="$ctrl.command.subCommands && $ctrl.command.subCommands.length > 0">

              <div ng-if="$ctrl.command.baseCommandDescription" style="padding-bottom: 15px;">
                <span style="font-weight: 600;">{{$ctrl.command.trigger}}</span>  —  <span style="font-size: 13px;">{{$ctrl.command.baseCommandDescription}}</span>
              </div>
              <div ng-repeat="subCmd in $ctrl.command.subCommands track by $index" style="padding-top: 5px; padding-bottom: 15px;">
                <span style="font-weight: 600;">{{$ctrl.command.trigger}} {{subCmd.usage}}</span>  —  <span style="font-size: 13px;">{{subCmd.description}}</span>
                <!--<div style="padding-left:15px;">
                    <div style="display: inline-block; margin-right: 25px;">
                        <div><span class="muted" style="font-size: 10px;"><i class="fas fa-lock-alt"></i> 再実行可能になるまでの待ち時間</span></div>
                        <div>
                            <span style="min-width: 51px; display: inline-block;" uib-tooltip="Global cooldown">
                                <i class="fal fa-globe"></i> {{$ctrl.command.cooldown.global ? $ctrl.command.cooldown.global + "s" : "-" }}
                            </span>
                            <span uib-tooltip="User cooldown">
                                <i class="fal fa-user"></i> {{$ctrl.command.cooldown.user ? $ctrl.command.cooldown.user + "s" : "-" }}
                            </span>
                        </div>
                    </div>
                    <div style="display: inline-block;">
                        <div><span class="muted" style="font-size: 10px;"><i class="fas fa-lock-alt"></i> 権限</span></div>
                        <div><span style="text-transform: capitalize;">{{$ctrl.getPermissionType(subCmd, true)}}</span> <tooltip type="info" text="$ctrl.getPermissionTooltip(subCmd, true)"></tooltip></div>
                    </div>
                </div>-->
              </div>
            </div>
            <div style="padding-top: 10px">
              <button class="btn btn-primary" ng-click="$ctrl.openEditSystemCommandModal()">編集</button>
              <button class="btn btn-default" ng-click="$ctrl.toggleCommandActiveState()">有効化の切り替え</button>
            </div>
          </div>
        </div>
      </div>
    `,
        controller: function(utilityService, commandsService, backendCommunicator, viewerRolesService) {
            const $ctrl = this;

            $ctrl.$onInit = function() {};

            /*$ctrl.getPermissionTooltip = (command, isSub) => {
                let type = command.permission ? command.permission.type : "";
                let cmdType = isSub ? "subcommand" : "command";
                switch (type) {
                case "group": {
                    let groups = command.permission.groups;
                    if (groups == null || groups.length < 1) {
                        return `This ${cmdType} is set to Group permissions, but no groups are selected.`;
                    }
                    return `This ${cmdType} is restricted to the groups: ${command.permission.groups.join(
                        ", "
                    )}`;
                }
                case "individual": {
                    let username = command.permission.username;
                    if (username == null || username === "") {
                        return `This ${cmdType} is set to restrict to an individual but a name has not been provided.`;
                    }
                    return `This ${cmdType} is restricted to the user: ${username}`;
                }
                default:
                    if (isSub) {
                        return `This ${cmdType} will use the permissions of the base command.`;
                    }
                    return `This ${cmdType} is available to everyone`;
                }
            };*/

            $ctrl.getPermissionType = (command, isSub) => {

                const permissions = command.restrictionData && command.restrictionData.restrictions &&
                  command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                if (permissions) {
                    if (permissions.mode === "roles") {
                        return "役割";
                    } else if (permissions.mode === "viewer") {
                        return "視聴者";
                    }
                } else {
                    if (isSub) {
                        return "継承";
                    }
                    return "なし";
                }
            };

            $ctrl.getPermissionTooltip = (command, isSub) => {

                const permissions = command.restrictionData && command.restrictionData.restrictions &&
                  command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                if (permissions) {
                    if (permissions.mode === "roles") {
                        const roleIds = permissions.roleIds;
                        let output = "選択なし";
                        if (roleIds.length > 0) {
                            output = roleIds
                                .filter(id => viewerRolesService.getRoleById(id) != null)
                                .map(id => viewerRolesService.getRoleById(id).name)
                                .join(", ");
                        }
                        return `役割 (${output})`;
                    } else if (permissions.mode === "viewer") {
                        return `視聴者 (${permissions.username ? permissions.username : '名無し'})`;
                    }
                } else {
                    if (isSub) {
                        return "ベースコマンドの権限を採用します";
                    }
                    return "誰でも利用できる";
                }
            };

            $ctrl.openEditSystemCommandModal = function() {
                const cmd = $ctrl.command;

                utilityService.showModal({
                    component: "editSystemCommandModal",
                    windowClass: "no-padding-modal",
                    resolveObj: {
                        command: () => cmd
                    },
                    closeCallback: (resp) => {
                        const action = resp.action;
                        if (action === "save") {
                            commandsService.saveSystemCommandOverride(resp.command);
                        } else if (action === "reset") {
                            backendCommunicator.fireEvent("remove-system-command-override", cmd.id);
                        }
                    }
                });
            };

            $ctrl.resetCooldownsForCommand = () => {
                commandsService.resetCooldownsForCommand($ctrl.command.id);
            };

            $ctrl.toggleCommandActiveState = function() {
                $ctrl.command.active = !$ctrl.command.active;
                commandsService.saveSystemCommandOverride($ctrl.command);
            };

            $ctrl.sysCommandMenuOptions = () => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> Edit</a>`,
                        click: function () {
                            $ctrl.openEditSystemCommandModal();
                        }
                    },
                    {
                        html: `<a href ><i class="iconify" data-icon="mdi:clock-fast" style="margin-right: 10px;"></i> Clear Cooldowns</a>`,
                        click: () => {
                            $ctrl.resetCooldownsForCommand();
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-toggle-off" style="margin-right: 10px;"></i> ${$ctrl.command.active ? "Disable Command" : "Enable Command"}</a>`,
                        click: function () {
                            $ctrl.command.active = !$ctrl.command.active;
                            commandsService.saveSystemCommandOverride($ctrl.command);
                        }
                    }
                ];

                return options;
            };
        }
    });
}());
