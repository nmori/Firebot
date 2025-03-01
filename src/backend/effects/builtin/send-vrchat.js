"use strict";

const { SettingsManager } = require("../../common/settings-manager");
const { ResourceTokenManager } = require("../../resource-token-manager");
const webServer = require("../../../server/http-server-manager");
const fs = require('fs-extra');
const logger = require("../../logwrapper");
const path = require("path");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectCategory } = require('../../../shared/effect-constants');
const { wait } = require("../../utility");

const voicelists = [];

const playSound = {
    definition: {
        id: "firebot:send-vrchat",
        name: "ゆかコネNEO経由でVRChatへチャット送信",
        description: "チャットメッセージを送信します",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="通信設定" pad-top="true">
        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
            <label for="port" class="control-label">連携サーバのHTTPポート</label>
            <input 
                type="number" 
                class="form-control input-lg" 
                id="port" 
                name="port"
                placeholder="ポート" 
                ng-model="effect.port"
                required
                min="0" 
                style="width: 50%;" 
            />
            <p class="help-block">ゆかりネットコネクターNEO v2.1～の翻訳/発話連携プラグインと読み上げ連携プラグインが必要です。</p>
        </div>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
        
    `,
    optionsController: async ($scope) => {

        if ($scope.effect.port == null) {
            $scope.effect.port = 8080;
        }

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.port == null || effect.port === "") {
            errors.push("ポート番号を指定してください");
        }

        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;

        try {

            const crypto = require("crypto");

            const voiceQuery = {
                operation: 'chat',
                params: [
                    {
                        id: crypto.randomUUID(),
                        text: effect.message,
                        talker: effect.username,
                        target: [
                            'vrchat',
                        ]
                    }
                ]
            };

            const response = await fetch(
                `http://127.0.0.1:${effect.port}/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(voiceQuery)
                });

            const responseData = await response.text();

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return true;
    },
};

module.exports = playSound;
