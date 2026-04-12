"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const commandHandler = require("../../chat/commands/commandHandler");

/**
 * The Delay effect
 */
const model = {
    /**
   * The definition of the Effect
   */
    definition: {
        id: "firebot:runcommand",
        name: "繧ｳ繝槭Φ繝峨ｒ螳溯｡・,
        description: "驕ｸ謚槭＠縺溘き繧ｹ繧ｿ繝繧ｳ繝槭Φ繝峨↓菫晏ｭ倥＆繧後※縺・ｋ貍泌・繧貞ｮ溯｡後＠縺ｾ縺吶・,
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
    <eos-container header="繧ｳ繝槭Φ繝峨・遞ｮ鬘・ pad-top="true">
        <dropdown-select options="{ system: 'System', custom: 'Custom'}" selected="effect.commandType"></dropdown-select>
    </eos-container>

        <eos-container header="螳溯｡後さ繝槭Φ繝・ pad-top="true">
            <firebot-searchable-select
                ng-show="effect.commandType === 'system'"
                ng-model="effect.systemCommandId"
                placeholder="繝励Μ繧ｻ繝・ヨ貍泌・繝ｪ繧ｹ繝医・驕ｸ謚槭∪縺溘・讀懃ｴ｢..."
                items="systemCommands"
                item-name="trigger"
            />

            <firebot-searchable-select
                ng-show="effect.commandType === 'custom'"
                ng-model="effect.commandId"
                placeholder="繝励Μ繧ｻ繝・ヨ貍泌・繝ｪ繧ｹ繝医・驕ｸ謚槭∪縺溘・讀懃ｴ｢..."
                items="customCommands"
                item-name="trigger"
            />
        </eos-container>

        <eos-container header="蠑墓焚(莉ｻ諢・" pad-top="true">
            <input type="text" style="margin-top: 20px;" class="form-control" ng-model="effect.args" placeholder="Enter some arguments..." replace-variables>
        </eos-container>

        <eos-container header="繧ｳ繝槭Φ繝峨ｒ襍ｷ蜍輔☆繧玖ｦ冶・閠・ｼ井ｻｻ諢擾ｼ・ pad-top="true">
            <input type="text" style="margin-top: 20px;" class="form-control" ng-model="effect.username" placeholder="Enter a username..." replace-variables>
        </eos-container>

        <eos-container>
            <div class="effect-info alert alert-info" pad-top="true">
            驕ｸ謚槭＆繧後◆繧ｳ繝槭Φ繝峨・繧ｨ繝輔ぉ繧ｯ繝医′繧ｳ繝槭Φ繝牙崋譛峨・繧ゅ・($arg螟画焚縺ｪ縺ｩ)繧呈戟縺｣縺ｦ縺・ｋ蝣ｴ蜷医√メ繝｣繝・ヨ繧､繝吶Φ繝医・繧ｳ繝ｳ繝・く繧ｹ繝亥､悶〒螳溯｡後☆繧九→縲∽ｺ域悄縺励↑縺・ｵ先棡縺ｫ縺ｪ繧句庄閭ｽ諤ｧ縺後≠繧九％縺ｨ縺ｫ逡呎э縺励※縺上□縺輔＞縲・            </div>
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
    optionsValidator: effect => {
        const errors = [];
        if (effect.commandType === "custom" && (effect.commandId == null || effect.commandId === "")) {
            errors.push("螳溯｡後☆繧九き繧ｹ繧ｿ繝繧ｳ繝槭Φ繝峨ｒ驕ｸ謚槭＠縺ｦ縺上□縺輔＞縲・);
        }
        if (effect.commandType === "system" && (effect.systemCommandId == null || effect.systemCommandId === "")) {
            errors.push("螳溯｡後☆繧九す繧ｹ繝・Β繧ｳ繝槭Φ繝峨ｒ驕ｸ謚槭＠縺ｦ縺上□縺輔＞縲・);
        }
        return errors;
    },
    /**
   * When the effect is triggered by something
   */
    onTriggerEvent: event => {
        return new Promise(resolve => {
            const { effect, trigger } = event;

            const clonedTrigger = JSON.parse(JSON.stringify(trigger));
            if (effect.username != null && effect.username.length > 0) {
                clonedTrigger.metadata.username = effect.username;
            }

            if (effect.commandType === "system") {
                commandHandler.runSystemCommandFromEffect(effect.systemCommandId, clonedTrigger, effect.args);
            } else {
                // always fall back to custom command to ensure backwards compat
                commandHandler.runCustomCommandFromEffect(effect.commandId || effect.customCommandId, clonedTrigger, effect.args);
            }
            resolve(true);
        });
    }
};

module.exports = model;
