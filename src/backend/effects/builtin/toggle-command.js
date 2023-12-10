"use strict";

const frontendCommunicator = require("../../common/frontend-communicator");
const commandManager = require("../../chat/commands/CommandManager");
const { EffectCategory } = require('../../../shared/effect-constants');

const chat = {
    definition: {
        id: "firebot:toggle-command",
        name: "コマンドのアクティブ状態を変更",
        description: "コマンドのアクティブ・ステータスを切り替える",
        icon: "fad fa-toggle-off",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container>
            <p>この演出を使用すると、コマンドのアクティブステータスを自動的に切り替えることができます。</p>
        </eos-container>

        <eos-container header="コマンド種類" pad-top="true">
            <dropdown-select options="{ system: 'System', custom: 'Custom'}" selected="effect.commandType"></dropdown-select>
        </eos-container>

        <eos-container ng-show="effect.commandType === 'system'" header="システムコマンド" pad-top="true">
            <ui-select ng-model="effect.commandId" theme="bootstrap">
                <ui-select-match placeholder="コマンドを探す... ">{{$select.selected.trigger}}</ui-select-match>
                <ui-select-choices repeat="command.id as command in systemCommands | filter: { trigger: $select.search }" style="position:relative;">
                    <div ng-bind-html="command.trigger | highlight: $select.search"></div>
                </ui-select-choices>
            </ui-select>
        </eos-container>

        <eos-container ng-show="effect.commandType === 'custom'" header="カスタムコマンド" pad-top="true">
            <ui-select ng-model="effect.commandId" theme="bootstrap">
                <ui-select-match placeholder="コマンドを探す... ">{{$select.selected.trigger}}</ui-select-match>
                <ui-select-choices repeat="command.id as command in customCommands | filter: { trigger: $select.search }" style="position:relative;">
                    <div ng-bind-html="command.trigger | highlight: $select.search"></div>
                </ui-select-choices>
            </ui-select>
        </eos-container>

        <eos-container header="アクションを切り替え" pad-top="true">
            <dropdown-select options="toggleOptions" selected="effect.toggleType"></dropdown-select>
        </eos-container>
    `,
    optionsController: ($scope, commandsService) => {
        $scope.systemCommands = commandsService.getSystemCommands();
        $scope.customCommands = commandsService.getCustomCommands();

        $scope.toggleOptions = {
            disable: "非アクティブ",
            enable: "アクティブ",
            toggle: "切り替え"
        };

        if ($scope.effect.toggleType == null) {
            $scope.effect.toggleType = "disable";
        }
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.commandId == null) {
            errors.push("コマンドを入れてください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const { commandId, commandType, toggleType } = event.effect;

        if (commandType === "system") {
            const systemCommand = commandManager
                .getAllSystemCommandDefinitions().find(c => c.id === commandId);

            if (systemCommand == null) {
                // command doesnt exist anymore
                return true;
            }

            systemCommand.active = toggleType === "toggle" ? !systemCommand.active : toggleType === "enable";

            commandManager.saveSystemCommandOverride(systemCommand);

            frontendCommunicator.send("systemCommandsUpdated");
        } else if (commandType === "custom") {
            const customCommand = commandManager.getCustomCommandById(commandId);

            if (customCommand == null) {
                // command doesnt exist anymore
                return true;
            }

            customCommand.active = toggleType === "toggle" ? !customCommand.active : toggleType === "enable";

            commandManager.saveCustomCommand(customCommand, "System", false);

            frontendCommunicator.send("custom-commands-updated");
        }
    }
};

module.exports = chat;