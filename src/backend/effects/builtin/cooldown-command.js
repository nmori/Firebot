"use strict";

const model = {
    definition: {
        id: "firebot:cooldown-command",
        name: "コマンドクールダウン管理",
        description: "コマンドのクールダウンを手動で追加または削除します",
        icon: "fad fa-hourglass-half",
        categories: ["common", "advanced", "scripting", "firebot control"],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="選択方法" ng-init="showSubcommands = effect.subcommandId != null">
            <div ng-if="sortTags && sortTags.length">
                <label class="control-fb control--radio">単一コマンド
                    <input type="radio" ng-model="effect.selectionType" value="command" ng-change="typeSelected()" />
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio">タグでまとめて指定
                    <input type="radio" ng-model="effect.selectionType" value="sortTag" ng-change="typeSelected()" />
                    <div class="control__indicator"></div>
                </label>
            </div>

            <div ng-if="effect.selectionType && effect.selectionType === 'command'">
                <firebot-searchable-select
                    ng-model="effect.commandId"
                    placeholder="コマンドを選択または検索..."
                    items="commands"
                    item-name="trigger"
                    on-select="commandSelected(item)"
                />
            </div>

            <div ng-if="effect.selectionType && effect.selectionType === 'sortTag'">
                <firebot-searchable-select
                    ng-model="effect.sortTagId"
                    placeholder="タグを選択または検索..."
                    items="sortTags"
                />
            </div>

            <div ng-show="subcommands && !!subcommands.length" class="mt-4 pl-4">
                <label class="control-fb control--radio">親コマンドにクールダウン
                    <input type="radio" ng-model="showSubcommands" ng-value="false" ng-click="effect.subcommandId = null"/>
                    <div class="control__indicator"></div>
                </label>
                <label class="control-fb control--radio" >サブコマンドにクールダウン
                    <input type="radio" ng-model="showSubcommands" ng-value="true"/>
                    <div class="control__indicator"></div>
                </label>

                <div ng-show="showSubcommands">
                    <dropdown-select selected="effect.subcommandId" options="subcommandOptions" placeholder="選択してください"></dropdown-select>
                </div>
            </div>
        </eos-container>

        <eos-container header="操作" pad-top="true" ng-show="effect.commandId != null || effect.sortTagId != null">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="list-effect-type">{{effect.action ? actionLabel(effect.action) : '選択してください'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu cooldown-effect-dropdown">
                    <li ng-click="effect.action = 'Add'">
                        <a href>追加</a>
                    </li>
                    <li ng-click="effect.action = 'Clear'">
                        <a href>解除</a>
                    </li>
                </ul>
            </div>
        </eos-container>

        <eos-container header="クールダウン" pad-top="true" ng-show="effect.action === 'Add'">
            <div class="mt-2">
                <label class="control-fb control--checkbox"> 全体クールダウン
                    <input type="checkbox" ng-init="showGlobal = (effect.globalCooldownSecs != null && effect.globalCooldownSecs !== '')" ng-model="showGlobal"  ng-click="effect.globalCooldownSecs = undefined">
                    <div class="control__indicator"></div>
                </label>
                <div uib-collapse="!showGlobal" class="mb-6 ml-6">
                    <div class="input-group">
                        <span class="input-group-addon" id="globalsecs">秒数</span>
                        <input type="text" class="form-control" aria-describedby="globalsecs" replace-variables="number" ng-model="effect.globalCooldownSecs" placeholder="秒数を入力">
                    </div>
                </div>
            </div>
            <div class="mt-2">
                <label class="control-fb control--checkbox"> ユーザー個別クールダウン
                    <input type="checkbox" ng-init="showUser = (effect.userCooldownSecs != null && effect.userCooldownSecs !== '' && effect.username != null && effect.username !== '')" ng-model="showUser" ng-click="effect.userCooldownSecs = undefined; effect.username = undefined;">
                    <div class="control__indicator"></div>
                </label>
                <div uib-collapse="!showUser" class="mb-6 ml-6">
                    <div class="input-group">
                        <span class="input-group-addon" id="username">ユーザー名</span>
                        <input type="text" class="form-control" aria-describedby="username" replace-variables ng-model="effect.username" placeholder="ユーザー名を入力">
                    </div>
                    <div class="muted ml-1 mt-px text-lg">ヒント: <b>$user</b> を使うと関連ユーザーにクールダウンを適用できます</div>
                    <div class="input-group mt-6">
                        <span class="input-group-addon" id="usersecs">秒数</span>
                        <input type="text" class="form-control" aria-describedby="usersecs" replace-variables="number" ng-model="effect.userCooldownSecs" placeholder="秒数を入力">
                    </div>
                </div>
            </div>
        </eos-container>
        <eos-container header="クールダウン" pad-top="true" ng-show="effect.action === 'Clear'">
            <div class="mt-2">
                <label class="control-fb control--checkbox"> 全体クールダウンを解除
                    <input type="checkbox" ng-model="effect.clearGlobalCooldown">
                    <div class="control__indicator"></div>
                </label>
            </div>
            <div class="mt-2">
                <label class="control-fb control--checkbox"> ユーザー個別クールダウンを解除
                    <input type="checkbox" ng-model="effect.clearUserCooldown">
                    <div class="control__indicator"></div>
                </label>
                <div uib-collapse="!effect.clearUserCooldown" class="mb-6 ml-6">
                    <div class="input-group">
                        <span class="input-group-addon" id="username">ユーザー名</span>
                        <input type="text" class="form-control" aria-describedby="username" replace-variables ng-model="effect.clearUsername" placeholder="ユーザー名を入力">
                    </div>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: ($scope, commandsService, sortTagsService) => {
        $scope.commands = commandsService.getCustomCommands();
        $scope.sortTags = sortTagsService.getSortTags('commands');

        $scope.subcommands = [];
        $scope.subcommandOptions = {};

        if ($scope.effect.selectionType == null) {
            if ($scope.effect.commandId != null && $scope.effect.sortTagId == null) {
                $scope.effect.selectionType = 'command';
            }

            if ($scope.commands != null) {
                $scope.effect.selectionType = 'command';
            }
        }

        $scope.createSubcommandOptions = () => {
            const options = {};
            if ($scope.subcommands) {
                $scope.subcommands.forEach((sc) => {
                    options[sc.id] = sc.regex || sc.fallback ? (sc.usage || (sc.fallback ? "Fallback" : "")).split(" ")[0] : sc.arg;
                });
            }
            $scope.subcommandOptions = options;
        };

        $scope.getSubcommands = () => {
            $scope.subcommands = [];
            const commandId = $scope.effect.commandId;
            if (commandId == null) {
                return;
            }
            const command = $scope.commands.find(c => c.id === commandId);
            if (command == null) {
                return;
            }
            if (command.subCommands) {
                $scope.subcommands = command.subCommands;
            }

            if (command.fallbackSubcommand) {
                $scope.subcommands.push(command.fallbackSubcommand);
            }

            $scope.createSubcommandOptions();
        };

        $scope.typeSelected = () => {
            if ($scope.effect.selectionType === "sortTag") {
                $scope.effect.commandId = null;
                $scope.showSubcommands = false;
                $scope.subcommands = [];
                $scope.effect.subcommandId = null;
            } else {
                $scope.effect.sortTagId = null;
            }
        };

        $scope.commandSelected = (command) => {
            $scope.effect.commandId = command.id;
            $scope.getSubcommands();
        };

        $scope.actionLabel = function (action) {
            switch (action) {
                case "Add": return "追加";
                case "Clear": return "解除";
                default: return action;
            }
        };

        $scope.getSubcommands();
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.commandId == null && effect.sortTagId == null) {
            errors.push("コマンドまたはタグを選択してください。");
        }
        if (effect.userCooldownSecs != null && (effect.username == null || effect.username === '')) {
            errors.push("ユーザー個別クールダウンには対象ユーザー名を指定してください。");
        }
        if (effect.clearUserCooldown != null && (effect.clearUsername == null || effect.clearUsername === '')) {
            errors.push("ユーザー個別クールダウンの解除には対象ユーザー名を指定してください。");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect } = event;
        const commandIds = [];

        if (effect.commandId == null && effect.sortTagId == null) {
            return false;
        }

        if (effect.commandId != null && (effect.selectionType == null || effect.selectionType === "command")) {
            commandIds.push(effect.commandId);
        }

        if (effect.sortTagId != null && effect.selectionType === "sortTag") {
            const { CommandManager } = require("../../chat/commands/command-manager");
            const commands = CommandManager.getAllCustomCommands().filter(c => c.sortTags?.includes(effect.sortTagId));
            commands.forEach(c => commandIds.push(c.id));
        }

        const commandCooldownManager = require("../../chat/commands/command-cooldown-manager");
        commandIds.forEach((id) => {
            if (effect.action === "Add") {
                commandCooldownManager.manuallyCooldownCommand({
                    commandId: id,
                    subcommandId: effect.subcommandId,
                    username: effect.username,
                    cooldown: {
                        global: !isNaN(effect.globalCooldownSecs) ? parseInt(effect.globalCooldownSecs) : undefined,
                        user: !isNaN(effect.userCooldownSecs) && effect.username != null && effect.username !== '' ? parseInt(effect.userCooldownSecs) : undefined
                    }
                });
            } else if (effect.action === "Clear") {
                commandCooldownManager.manuallyClearCooldownCommand({
                    commandId: id,
                    subcommandId: effect.subcommandId,
                    username: effect.clearUsername,
                    cooldown: {
                        global: effect.clearGlobalCooldown,
                        user: effect.clearUserCooldown
                    }
                });
            }
        });

        return true;
    }
};

module.exports = model;
