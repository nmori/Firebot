"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const logger = require("../../../backend/logwrapper");

const addFirebotLogMessage = {
    definition: {
        id: "firebot:log-message",
        name: "繝ｭ繧ｰ繝｡繝・そ繝ｼ繧ｸ",
        description: "Firebot 縺ｮ繝ｭ繧ｰ縺ｫ繧ｨ繝ｳ繝医Μ繧定ｿｽ蜉縺励∪縺吶ゅ％繧後・繝・ヰ繝・げ縺ｫ萓ｿ蛻ｩ縺ｧ縺吶・,
        icon: "fad fa-file-alt",
        categories: [EffectCategory.ADVANCED, EffectCategory.SCRIPTING],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="繝｡繝・そ繝ｼ繧ｸ繝・く繧ｹ繝・>
            <p class="muted">Firebot縺ｮ繝ｭ繧ｰ繝輔ぃ繧､繝ｫ縺ｫ譖ｸ縺崎ｾｼ縺ｿ縺溘＞繝｡繝・そ繝ｼ繧ｸ繧貞・蜉帙＠縺ｾ縺吶・/p>
            <textarea ng-model="effect.logMessage" id="log-message-text" class="form-control" placeholder="Enter log message text" menu-position="under" replace-variables></textarea>
        </eos-container>

        <eos-container header="Log Level" pad-top="true">
            <p class="muted">繝｡繝・そ繝ｼ繧ｸ繧呈嶌縺崎ｾｼ繧繝ｭ繧ｰ繝ｬ繝吶Ν繧帝∈謚槭＠縺ｾ縺吶・繝・ヰ繝・げ繝ｻ繝ｬ繝吶Ν縺ｮ繝｡繝・そ繝ｼ繧ｸ縺ｯ縲√ョ繝舌ャ繧ｰ繝ｻ繝｢繝ｼ繝峨′譛牙柑縺ｪ蝣ｴ蜷医↓縺ｮ縺ｿ譖ｸ縺崎ｾｼ縺ｾ繧後ｋ縺薙→縺ｫ豕ｨ諢上＠縺ｦ縺上□縺輔＞縲・/p>
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
            errors.push("繝ｭ繧ｰ繝｡繝・そ繝ｼ繧ｸ繧貞・蜉帙＠縺ｦ縺上□縺輔＞");
        }
        if (effect.logLevel == null) {
            errors.push("繝ｭ繧ｰ繝ｬ繝吶Ν繧帝∈謚槭＠縺ｦ縺上□縺輔＞");
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
