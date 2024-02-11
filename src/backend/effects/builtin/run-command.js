"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const commandRunner = require("../../chat/commands/command-runner");

/**
 * The Delay effect
 */
const model = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:runcommand",
        name: "コマンドを実行",
        description: "選択したカスタムコマンドに保存されている演出を実行します。",
        icon: "fad fa-exclamation-square",
        categories: [EffectCategory.ADVANCED],
        dependencies: []
    },
    /**
   * Global settings that will be available in the Settings tab
   */
    globalSettings: {},
    /**
   * The HTML template for the Options view (ie options when effect is added to something such as a button.
   * You can alternatively supply a url to a html file via optionTemplateUrl
   */
    optionsTemplate: `
    <eos-container header="コマンドの種類" pad-top="true">
        <dropdown-select options="{ system: 'System', custom: 'Custom'}" selected="effect.commandType"></dropdown-select>
    </eos-container>

        <eos-container header="実行コマンド" pad-top="true">
            <ui-select ng-model="effect.systemCommandId" theme="bootstrap" ng-show="effect.commandType === 'system'">
                <ui-select-match placeholder="コマンドの選択または検索... ">{{$select.selected.trigger}}</ui-select-match>
                <ui-select-choices repeat="command.id as command in systemCommands | filter: { trigger: $select.search }" style="position:relative;">
                    <div ng-bind-html="command.trigger | highlight: $select.search"></div>
                </ui-select-choices>
            </ui-select>

            <ui-select ng-model="effect.commandId" theme="bootstrap" ng-show="effect.commandType === 'custom'">
                <ui-select-match placeholder="コマンドの選択または検索... ">{{$select.selected.trigger}}</ui-select-match>
                <ui-select-choices repeat="command.id as command in customCommands | filter: { trigger: $select.search }" style="position:relative;">
                    <div ng-bind-html="command.trigger | highlight: $select.search"></div>
                </ui-select-choices>
            </ui-select>
        </eos-container>

        <eos-container header="引数(任意)" pad-top="true">
            <input type="text" style="margin-top: 20px;" class="form-control" ng-model="effect.args" placeholder="Enter some arguments..." replace-variables>
        </eos-container>

        <eos-container header="コマンドを起動する視聴者（任意）" pad-top="true">
            <input type="text" style="margin-top: 20px;" class="form-control" ng-model="effect.username" placeholder="Enter a username..." replace-variables>
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-info" pad-top="true">
            選択されたコマンドのエフェクトがコマンド固有のもの($arg変数など)を持っている場合、チャットイベントのコンテキスト外で実行すると、予期しない結果になる可能性があることに留意してください。
            </div>
        </eos-container>
    `,
    /**
   * The controller for the front end Options
   */
    optionsController: ($scope, commandsService) => {

        // if commandType is null we must assume "custom" to maintain backwards compat
        if ($scope.effect.commandType == null) {
            $scope.effect.commandType = "custom";
        }

        $scope.systemCommands = commandsService.getSystemCommands();
        $scope.customCommands = commandsService.getCustomCommands();
    },
    /**
   * When the effect is saved
   */
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.commandType === "custom" && (effect.commandId == null || effect.commandId === "")) {
            errors.push("実行するカスタムコマンドを選択してください。");
        }
        if (effect.commandType === "system" && (effect.systemCommandId == null || effect.systemCommandId === "")) {
            errors.push("実行するシステムコマンドを選択してください。");
        }
        return errors;
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: (event) => {
        return new Promise((resolve) => {
            const { effect, trigger } = event;

            const clonedTrigger = JSON.parse(JSON.stringify(trigger));
            if (effect.username != null && effect.username.length > 0) {
                clonedTrigger.metadata.username = effect.username;
            }

            if (effect.commandType === "system") {
                commandRunner.runSystemCommandFromEffect(effect.systemCommandId, clonedTrigger, effect.args);
            } else {
                // always fall back to custom command to ensure backwards compat
                commandRunner.runCustomCommandFromEffect(effect.commandId || effect.customCommandId, clonedTrigger, effect.args);
            }
            resolve(true);
        });
    }
};

module.exports = model;
