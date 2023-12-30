"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const logger = require("../../../backend/logwrapper");

const addFirebotLogMessage = {
    definition: {
        id: "firebot:log-message",
        name: "ログメッセージ",
        description: "Firebot のログにエントリを追加します。これはデバッグに便利です。",
        icon: "fad fa-file-alt",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="メッセージテキスト">
            <p class="muted">Firebotのログファイルに書き込みたいメッセージを入力します。</p>
            <input ng-model="effect.logMessage" id="log-message-text" type="text" class="form-control" placeholder="Enter log message text" replace-variables>
        </eos-container>

        <eos-container header="Log Level" pad-top="true">
            <p class="muted">メッセージを書き込むログレベルを選択します。 デバッグ・レベルのメッセージは、デバッグ・モードが有効な場合にのみ書き込まれることに注意してください。</p>
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="log-message-type-effect-log-level">{{effect.logLevel ? effect.logLevel : "Pick one"}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
                <li ng-repeat="logLevel in logLevelTypes"
                    ng-click="effect.logLevel = logLevel">
                    <a href>{{logLevel}}</a>
                </li>
            </ul>
        </eos-container>
    `,
    optionsController: ($scope) => {
        $scope.logLevelTypes = ["Info", "Warning", "Error", "Debug"];
        $scope.effect.logLevel = $scope.effect.logLevel ?? "Info";
    },
    optionsValidator: effect => {
        const errors = [];
        if (!(effect.logMessage?.length > 0)) {
            errors.push("ログメッセージを入力してください");
        }
        if (effect.logLevel == null) {
            errors.push("ログレベルを選択してください");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect }) => {
        switch (effect.logLevel) {
            case "Error":
                logger.error(effect.logMessage);
                break;

            case "Warning":
                logger.warn(effect.logMessage);
                break;

            case "Debug":
                logger.debug(effect.logMessage);
                break;

            // Use Info as default
            default:
                logger.info(effect.logMessage);
                break;
        }
    }
};

module.exports = addFirebotLogMessage;