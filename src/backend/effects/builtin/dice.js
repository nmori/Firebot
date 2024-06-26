"use strict";

const {handleDiceEffect} = require("../../common/handlers/diceProcessor");
const { EffectCategory, EffectDependency } = require('../../../shared/effect-constants');

const model = {
    definition: {
        id: "firebot:dice",
        name: "サイコロを振る",
        description: "チャットでサイコロの目を指定する",
        icon: "fad fa-dice",
        categories: [EffectCategory.FUN, EffectCategory.CHAT_BASED],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
        <eos-container header="サイコロ設定">
            <firebot-input
                input-title="サイコロの仕様"
                model="effect.dice"
                placeholder-text="2d20 or 2d10+1d12 or 1d10+3"
                menu-position="under"
            />
        </eos-container>

        <eos-container header="ディスプレイモード" pad-top="true">
            <firebot-radios
                options="displayModeOptions"
                model="effect.resultType"
            />
        </eos-container>

        <eos-chatter-select effect="effect" title="アカウント" pad-top="true"></eos-chatter-select>

        <eos-container pad-top="true">
            <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
                <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> ささやく
                    <input type="checkbox" ng-init="whisper = (effect.whisper != null && effect.whisper !== '')" ng-model="whisper" ng-click="effect.whisper = ''">
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="whisper">
                    <div class="input-group">
                        <span class="input-group-addon" id="chat-whisper-effect-type">宛先</span>
                        <input ng-model="effect.whisper" type="text" class="form-control" id="chat-whisper-setting" aria-describedby="chat-text-effect-type" placeholder="Username">
                    </div>
                </div>
            </div>
        </eos-container>
    `,
    optionsController: $scope => {
        $scope.displayModeOptions = {
            sum: { text: "合計", description: "Ex: 'ebiggz rolled a 7 on 2d6.'" },
            individual: { text: "各役割を含む", description: "Ex: 'ebiggz rolled a 7 (4, 3) on 2d6.'"}
        };

        $scope.effect.resultType = $scope.effect.resultType
            ? $scope.effect.resultType
            : "sum";
    },
    optionsValidator: effect => {
        const errors = [];
        if (!effect.dice) {
            errors.push("振りたいサイコロの目を入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {
        await handleDiceEffect(effect, trigger);
        return true;
    }
};

module.exports = model;
