"use strict";

const { EffectCategory } = require('../../../shared/effect-constants');
const frontendCommunicator = require("../../common/frontend-communicator");

const model = {
    definition: {
        id: "firebot:text-to-speech",
        name: "合成音声",
        description: "Firebotにテキストを読ませる。",
        icon: "fad fa-microphone-alt",
        categories: [EffectCategory.FUN],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
        <eos-container header="テキスト">
            <textarea ng-model="effect.text" class="form-control" name="text" placeholder="テキストを入力" rows="4" cols="40" replace-variables menu-position="under"></textarea>
        </eos-container>

        <eos-container header="音声" pad-top="true">
            <div class="dropdown">
                <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span class="dropdown-text">{{getSelectedVoiceName()}}</span>
                    <span class="caret"></span>
                </button>
                <ul class="dropdown-menu">
                    <li><a href ng-click="effect.voiceId = 'default'">既定の音声 <tooltip text="'設定 > TTSで設定されたデフォルトの音声'"></tooltip></a></li>
                    <li ng-repeat="voice in ttsVoices"><a href ng-click="effect.voiceId = voice.id">{{voice.name}}</a></li>
                </ul>
            </div>
        </eos-container>
    `,
    optionsController: ($scope, ttsService) => {
        if ($scope.effect.voiceId == null) {
            $scope.effect.voiceId = "default";
        }

        $scope.ttsVoices = ttsService.getVoices();

        $scope.getSelectedVoiceName = () => {
            const voiceId = $scope.effect.voiceId;
            if (voiceId === "default" || voiceId == null) {
                return "既定の音声";
            }

            const voice = ttsService.getVoiceById(voiceId);

            return voice ? voice.name : "不明な音声";
        };
    },
    optionsValidator: effect => {
        const errors = [];
        if (effect.text == null || effect.text.length < 1) {
            errors.push("テキストを入力してください。");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;

        frontendCommunicator.send("read-tts", {
            text: effect.text,
            voiceId: effect.voiceId
        });

        return true;
    }
};

module.exports = model;
