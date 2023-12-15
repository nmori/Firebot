"use strict";

const { settings } = require("../../common/settings-access");
const resourceTokenManager = require("../../resourceTokenManager");
const webServer = require("../../../server/http-server-manager");
const fs = require('fs-extra');
const logger = require("../../logwrapper");
const path = require("path");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectCategory } = require('../../../shared/effect-constants');
const { wait } = require("../../utility");
const axiosDefault = require("axios").default;

const axios = axiosDefault.create({
    headers: {
        'User-Agent': 'Firebot v5 - YNCNEO'
    }
});

axios.interceptors.request.use(request => {
    //logger.debug('HTTP Request Effect [Request]: ', JSON.parse(JSON.stringify(request)));
    return request;
});

axios.interceptors.response.use(response => {
    //logger.debug('HTTP Request Effect [Response]: ', JSON.parse(JSON.stringify(response)));
    return response;
});

const voicelists = [];

const playSound = {
    definition: {
        id: "firebot:translate-yncneo",
        name: "ゆかコネNEO経由で翻訳",
        description: "ゆかコネNEOをつかって翻訳します",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-container header="メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="翻訳先言語コード" pad-top="true">
            <textarea ng-model="effect.language" class="form-control" name="text" placeholder="言語コードを指定" rows="1" cols="10" replace-variables></textarea>
            <p class="help-block">日本語＝ja_JP、英語＝en_US</p>
        </eos-container>

        <eos-container header="翻訳成功時の後演出" pad-top="true" >
            <effect-list effects="effect.successEffects"
                trigger="{{trigger}}"
                trigger-meta="triggerMeta"
                update="successEffectsUpdated(effects)"
                modalId="{{modalId}}"></effect-list>
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
            <p class="help-block">ゆかりネットコネクターNEO v2.1～の翻訳/発話連携プラグインと翻訳エンジン選択が必要です。</p>
        </div>
        
    `,
    optionsController: async($scope) =>  {
        $scope.successEffectsUpdated = async(effects) =>{
            $scope.effect.successEffects = effects;
        };

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.port == null || effect.port ==="") {
            errors.push("ポート番号を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {

        const { effect, trigger } = event;
        try {
            // HTTP header
            var headers = {
                'Content-Type': 'application/json'
            };

            const crypto = require("crypto");

            const translateQuery={
                operation: 'translate',
                params: [
                    {
                        id: crypto.randomUUID(),
                        text: effect.message,
                        lang: effect.language,
                    }
                ]
            };

            const response = await axios({
                method:'post',
                url: 'http://127.0.0.1:'+String(effect.port)+'/',
                data : JSON.stringify(translateQuery),
                header: headers
            });

            trigger.language = response.data.lang;
            trigger.translatedText = response.data.text;

            const processEffectsRequest = {
                trigger,
                effects: effect.successEffects
            };

            const effectResult = await effectRunner.processEffects(processEffectsRequest);
            if (effectResult != null && effectResult.success === true) {
                if (effectResult.stopEffectExecution) {
                    return {
                        success: true,
                        execution: {
                            stop: true,
                            bubbleStop: true
                        }
                    };
                }
            }
            
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return true;
    },
};

module.exports = playSound;
