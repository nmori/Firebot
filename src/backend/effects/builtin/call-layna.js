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
        'User-Agent': 'Firebot v5 - Layna'
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

const playSound = {
    definition: {
        id: "firebot:call-layna",
        name: "まるっとれいなにトリガーを出す",
        description: "まるっとれいなのカスタムアクションを呼び出します",
        icon: "fad fa-person-running",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-container header="カスタムアクション">
            <div class="btn-group">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="customAction-name">{{effect.actionItem ? effect.actionItem.name : '選択...'}}</span> <span class="caret"></span>
                </button>
                <ul class="dropdown-menu customAction-name-dropdown">
                    <li ng-repeat="actionItem in effect.actionList"
                        ng-click="effect.actionItem = actionItem">
                        <a href>{{actionItem.name}}</a>
                    </li>
                </ul>
            </div>
        </eos-container>        

        <eos-container header="名前" pad-top="true">
            <textarea ng-model="effect.name" class="form-control" name="text" placeholder="入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>
        <eos-container header="チャット文" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="入力" rows="4" cols="40" replace-variables></textarea>
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
            <p class="help-block">まるっとれいな v1.0.28～が必要です。</p>
        </div>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
        
    `,
    optionsController: async($scope) =>  {
        
        if ($scope.effect.port == null) {
            $scope.effect.port = 21000;
        }       

        $scope.effect.actionList = [];

        try {         

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

            const response = await axios({
                method:'get',
                url: 'http://127.0.0.1:'+String($scope.effect.port)+'/get-actions'
            });

            for (const actionItem of response.data) 
            {
                $scope.effect.actionList.push( { id: actionItem['id'],name: actionItem['Title'] } );
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.port == null || effect.port ==="") {
            errors.push("ポート番号を指定してください");
        }

        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;

        try {
            const response = await axios({
                method:'get',
                url: 'http://127.0.0.1:'+String(effect.port)+'/trigger?title='+ encodeURIComponent(effect.actionItem.name)+'&name='+ encodeURIComponent(effect.name)+'&comment='+ encodeURIComponent(effect.message),
            });
            
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return true;
    },
};

module.exports = playSound;
