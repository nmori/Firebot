"use strict";

(function() {
    angular.module("firebotApp").component("subcommandRow", {
        bindings: {
            subcommand: "=",
            fullyEditable: "<",
            cmdTrigger: "@",
            onDelete: "&",
            onEdit: "&"
        },
        template: `
            <div class="mb-4">
                <div class="sys-command-row" ng-init="hidePanel = true" ng-click="hidePanel = !hidePanel" ng-class="{'expanded': !hidePanel}" context-menu="$ctrl.subcommandContextMenu()" context-menu-orientation="left">
                    <div class="pl-8"" style="flex-basis: 30%;">
                        {{$ctrl.subcommand.regex || $ctrl.subcommand.fallback ? ($ctrl.subcommand.usage || "").split(" ")[0] : $ctrl.subcommand.arg}}
                        <span ng-show="$ctrl.fullyEditable">
                            <i ng-if="$ctrl.subcommandTypeTitle() === 'Number'" class="far fa-hashtag muted text-lg" uib-tooltip="数値サブコマンド"></i>
                            <i ng-if="$ctrl.subcommandTypeTitle() === 'Username'" class="far fa-at muted text-lg" uib-tooltip="ユーザー名サブコマンド"></i>
                        </span>
                    </div>

                    <div style="width: 25%">
                        <div ng-if="!$ctrl.subcommand.inheritBaseCommandCooldown">
                            <span style="min-width: 51px; display: inline-block;" uib-tooltip="全体クールダウン">
                                <i class="fal fa-globe"></i> {{$ctrl.subcommand.cooldown.global ? $ctrl.subcommand.cooldown.global + "s" : "-" }}
                            </span>
                            <span uib-tooltip="ユーザークールダウン">
                                <i class="fal fa-user"></i> {{$ctrl.subcommand.cooldown.user ? $ctrl.subcommand.cooldown.user + "s" : "-" }}
                            </span>
                        </div>
                        <div ng-if="$ctrl.subcommand.inheritBaseCommandCooldown">
                            <span style="text-transform: capitalize;">継承</span>
                            <tooltip type="info" text="'このサブコマンドはベースコマンドのクールダウンを使用します。'"></tooltip>
                        </div>
                    </div>

                    <div style="width: 25%">
                        <span style="text-transform: capitalize;">{{$ctrl.getPermissionType()}}</span>
                        <tooltip type="info" text="$ctrl.getPermissionTooltip()"></tooltip>
                    </div>

                    <div style="width: 25%">
                        <div style="min-width: 75px">
                            <span class="status-dot" ng-class="{'active': $ctrl.subcommand.active, 'notactive': !$ctrl.subcommand.active}"></span>
                            {{$ctrl.subcommand.active ? "有効" : "無効"}}
                        </div>
                    </div>

                    <div style="flex-basis:30px; flex-shrink: 0;">
                        <i class="fas" ng-class="{'fa-chevron-right': hidePanel, 'fa-chevron-down': !hidePanel}"></i>
                    </div>
                </div>

                <div uib-collapse="hidePanel" class="sys-command-expanded">
                    <div class="sub-command p-8">
                        <div>
                            <div class="settings-title">
                                <h4 class="font-semibold">説明 <tooltip class="text-2xl ml-1" text="'コマンド一覧ページに表示されます'"></tooltip></h4>
                            </div>
                            <input
                                class="form-control"
                                type="text"
                                placeholder="説明を入力"
                                ng-model="$ctrl.subcommand.description"
                                aria-describedby="subcommandDescription"
                            >
                            <p ng-hide="$ctrl.fullyEditable">{{$ctrl.subcommand.description}}</p>
                        </div>

                        <div class="mt-10">
                            <div class="settings-title">
                                <h4 class="font-semibold">使用方法</h4>
                            </div>
                            <p ng-show="!$ctrl.fullyEditable">{{$ctrl.cmdTrigger}} {{$ctrl.subcommand.usage ? $ctrl.subcommand.usage : $ctrl.subcommand.arg}}</p>
                            <div class="input-group" ng-hide="!$ctrl.fullyEditable">
                                <span class="input-group-addon">{{$ctrl.cmdTrigger}}{{!$ctrl.subcommand.regex ? " " + $ctrl.subcommand.arg : ""}}</span>
                                <input ng-hide="$ctrl.subcommand.regex" class="form-control" type="text" placeholder="テキストを入力" ng-model="$ctrl.compiledUsage" ng-change="$ctrl.onUsageChange()">
                                <input ng-show="$ctrl.subcommand.regex" class="form-control" type="text" placeholder="テキストを入力" ng-model="$ctrl.subcommand.usage">
                            </div>
                        </div>

                        <div class="mt-10" ng-show="$ctrl.fullyEditable">
                            <div class="settings-title">
                                <h4 class="font-semibold">
                                    追加の必須引数数
                                    <tooltip class="text-2xl ml-1" text="'サブコマンド引数の後に必要な追加引数の数です。満たさない場合、エフェクトは実行されません。'" />
                                </h4>
                            </div>
                            <input
                                ng-show="$ctrl.fullyEditable"
                                class="form-control"
                                type="number"
                                placeholder="数を入力"
                                ng-model="$ctrl.adjustedMinArgs"
                                ng-change="$ctrl.onMinArgsChange()"
                            >
                        </div>

                        <div class="mt-10" ng-hide="$ctrl.subcommand.hideCooldowns">
                            <div class="settings-title">
                                <h4 class="font-semibold">クールダウン</h4>
                            </div>
                            <firebot-checkbox
                                model="$ctrl.subcommand.inheritBaseCommandCooldown"
                                label="ベースコマンドのクールダウンを継承"
                                tooltip="有効にすると、このサブコマンドはベースコマンドのクールダウン設定を使用します。"
                            />
                            <command-cooldown-settings
                                ng-if="!$ctrl.subcommand.inheritBaseCommandCooldown"
                                command="$ctrl.subcommand"
                                message-setting-disabled="true"
                            />
                            <command-cooldown-settings
                                ng-if="$ctrl.subcommand.inheritBaseCommandCooldown"
                                disabled="true"
                                command="{ cooldown: {}}"
                                message-setting-disabled="true"
                            />
                        </div>

                        <div class="mt-10">
                            <div class="settings-title">
                                <h4 class="mb-2 font-semibold">
                                    制限
                                    <span class="muted pl-1 text-xl font-medium" style="font-family: 'Quicksand';">
                                        （権限、通貨コストなど）
                                    </span>
                                </h4>
                            </div>
                            <restrictions-list
                                restriction-data="$ctrl.subcommand.restrictionData"
                                trigger="command"
                            ></restrictions-section>
                        </div>

                        <div class="mt-10">
                            <div class="settings-title">
                                <h4 class="font-semibold">設定</h4>
                            </div>
                            <div class="controls-fb-inline pb-4">
                            <label class="control-fb control--checkbox">
                                有効
                                <input type="checkbox" ng-model="$ctrl.subcommand.active" aria-label="..." checked>
                                <div class="control__indicator"></div>
                            </label>

                            <label class="control-fb control--checkbox">
                                トリガーを自動削除 <tooltip text="'チャットを見やすく保つため、このサブコマンドを発火したメッセージを Firebot が自動で削除します。'"></tooltip>
                                <input type="checkbox" ng-model="$ctrl.subcommand.autoDeleteTrigger" aria-label="...">
                                <div class="control__indicator"></div>
                            </label>

                            <label class="control-fb control--checkbox">
                                非表示 <tooltip text="'このサブコマンドを !commands 一覧から隠します'"></tooltip>
                                <input type="checkbox" ng-model="$ctrl.subcommand.hidden" aria-label="...">
                                <div class="control__indicator"></div>
                            </label>
                            </div>
                        </div>

                        <div ng-if="$ctrl.fullyEditable" class="mt-6">
                            <effect-list
                                header="このサブコマンドで実行する内容"
                                effects="$ctrl.subcommand.effects"
                                trigger="command"
                                trigger-meta="{ rootEffects: $ctrl.subcommand.effects }"
                                update="$ctrl.effectListUpdated(effects)"
                                is-array="true"
                            ></effect-list>

                            <div class="mt-10">
                                <button class="btn btn-danger" ng-click="$ctrl.delete()" aria-label="サブコマンドを削除">
                                    <i class="far fa-trash"></i>
                                </button>
                                <button ng-hide="$ctrl.subcommand.fallback" class="btn btn-default ml-2" ng-click="$ctrl.edit()" aria-label="サブコマンドを編集">
                                    <i class="far fa-edit"></i> トリガーを編集
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        controller: function(viewerRolesService) {
            const $ctrl = this;

            $ctrl.subcommandTypeTitle = () => {
                if ($ctrl.fullyEditable) {
                    if (!$ctrl.subcommand.regex) {
                        return "Custom";
                    } else if ($ctrl.subcommand.fallback) {
                        return "Fallback";
                    } else if ($ctrl.subcommand.arg === '\\d+') {
                        return "Number";
                    } else if ($ctrl.subcommand.arg === '@\\w+') {
                        return "Username";
                    }
                }

                return "";
            };

            $ctrl.compiledUsage = "";
            $ctrl.onUsageChange = () => {
                $ctrl.subcommand.usage = `${$ctrl.subcommand.arg} ${$ctrl.compiledUsage}`;
            };

            $ctrl.adjustedMinArgs = 0;
            $ctrl.onMinArgsChange = () => {
                if ($ctrl.adjustedMinArgs > 0) {
                    $ctrl.subcommand.minArgs = $ctrl.adjustedMinArgs + 1;
                } else {
                    $ctrl.subcommand.minArgs = 1;
                }
            };

            $ctrl.$onInit = function() {
                if ($ctrl.subcommand) {
                    if ((!$ctrl.subcommand.regex && !$ctrl.subcommand.fallback) && $ctrl.subcommand.usage) {
                        $ctrl.compiledUsage = $ctrl.subcommand.usage.replace(`${$ctrl.subcommand.arg} `, "");
                    }
                    if ($ctrl.subcommand.minArgs > 0) {
                        $ctrl.adjustedMinArgs = $ctrl.subcommand.minArgs - 1;
                    }
                }
            };

            $ctrl.delete = () => {
                $ctrl.onDelete({ id: $ctrl.subcommand.id });
            };

            $ctrl.edit = () => {
                $ctrl.onEdit({ id: $ctrl.subcommand.id });
            };

            $ctrl.effectListUpdated = function(effects) {
                $ctrl.subcommand.effects = effects;
            };

            $ctrl.getPermissionType = () => {
                const command = $ctrl.subcommand;

                const permissions = command.restrictionData && command.restrictionData.restrictions &&
                command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                if (permissions) {
                    if (permissions.mode === "roles") {
                        return "ロール";
                    } else if (permissions.mode === "viewer") {
                        return "視聴者";
                    }
                } else {
                    return "継承";
                }
            };

            $ctrl.getPermissionTooltip = () => {
                const command = $ctrl.subcommand;
                const permissions = command.restrictionData && command.restrictionData.restrictions &&
                command.restrictionData.restrictions.find(r => r.type === "firebot:permissions");

                if (permissions) {
                    if (permissions.mode === "roles") {
                        const roleIds = permissions.roleIds;
                        let output = "未選択";
                        if (roleIds.length > 0) {
                            output = roleIds
                                .filter(id => viewerRolesService.getRoleById(id) != null)
                                .map(id => viewerRolesService.getRoleById(id).name)
                                .join(", ");
                        }
                        return `ロール（${output}）`;
                    } else if (permissions.mode === "viewer") {
                        return `視聴者（${permissions.username ? permissions.username : '未設定'}）`;
                    }
                } else {
                    return "このサブコマンドはベースコマンドの権限を使用します。";
                }
            };

            $ctrl.subcommandContextMenu = () => {
                const options = [
                    {
                        html: `<a href ><i class="far fa-pen" style="margin-right: 10px;"></i> トリガーを編集</a>`,
                        click: () => {
                            $ctrl.edit();
                        }
                    },
                    {
                        html: `<a href ><i class="far fa-${$ctrl.subcommand.active ? 'ban' : 'check'}" style="margin-right: 10px;"></i> ${$ctrl.subcommand.active ? '無効化' : '有効化'}</a>`,
                        click: () => {
                            $ctrl.subcommand.active = !$ctrl.subcommand.active;
                        }
                    },
                    {
                        html: `<a href style="color: #fb7373;"><i class="far fa-trash-alt" style="margin-right: 10px;"></i> 削除</a>`,
                        click: () => {
                            $ctrl.delete();
                        },
                        compile: true
                    }
                ];

                return options;
            };
        }
    });
}());
