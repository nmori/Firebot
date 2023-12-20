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
        'User-Agent': 'Firebot v5 - sendvrchat'
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
        id: "firebot:call-vtubestudio",
        name: "VTubeStudioキーバインドを起動",
        description: "ゆかコネNEO経由でVTubeStudioのキーバインドを起動します",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-container header="起動するキーバインド設定名" pad-top="true">
            <textarea ng-model="effect.tag" class="form-control" name="text" placeholder="キーバインド名" rows="1" cols="40" replace-variables></textarea>
        </eos-container>

        <eos-container header="通信設定" pad-top="true">
        <div class="form-group" ng-class="{'has-error': $ctrl.formFieldHasError('cost')}">
            <label for="port" class="control-label">ゆかコネAPIのHTTPポート</label>
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
            <p class="help-block">ゆかりネットコネクターNEO v2.1～のVTubeStudioプラグインが必要です。</p>
        </div>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
        
    `,
    optionsController: async($scope) =>  {
        const axiosDefault = require("axios").default;

        const axios = axiosDefault.create({

        });

        axios.interceptors.request.use(request => {
            //logger.debug('HTTP Request Effect [Request]: ', JSON.parse(JSON.stringify(request)));
            return request;
        });

        axios.interceptors.response.use(response => {
            //logger.debug('HTTP Request Effect [Response]: ', JSON.parse(JSON.stringify(response)));
            return response;
        });

        if ($scope.effect.port == null||$scope.effect.port === "") {
            $scope.effect.port = 15520;
        }       

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.port == null || effect.port ==="") {
            errors.push("ポート番号を指定してください");
        }
        if (effect.tag == null || effect.tag ==="") {
            errors.push("タグを指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;

        try {
            // HTTP header
            const response = await axios({
                method:'get',
                url: 'http://127.0.0.1:'+String(effect.port)+'/api/command?target=Plugin_VtubeStudio&command=call&tag='+ encodeURIComponent(effect.tag),
            });
            
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return true;
    },
};

module.exports = playSound;
