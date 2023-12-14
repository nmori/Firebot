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
        'User-Agent': 'Firebot v5 - ONECOMME'
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

const onecommeTransfer = {
    definition: {
        id: "firebot:onecomme-transfer",
        name: "わんコメに転送",
        description: "指定した文章をわんコメに転送します",
        icon: "fad fa-paw",
        categories: [EffectCategory.COMMON],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-container header="転送先">
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="slotname-name">{{effect.slotname ? effect.slotname.name : '選択...'}}</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu slotname-name-dropdown">
                <li ng-repeat="slotname in effect.slotnames""
                    ng-click="effect.slotname = slotname">
                    <a href>{{slotname.name}}</a>
                </li>
            </ul>
        </div>
    </eos-container>        

    <eos-container header="書き込み者名" pad-top="true">
        <textarea ng-model="effect.writerName" class="form-control" name="text" placeholder="名前の入力" rows="4" cols="40" replace-variables></textarea>
    </eos-container>
    <eos-container header="メッセージ" pad-top="true">
        <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
    </eos-container>
        
    `,
    optionsController: async($scope) =>  {

        if ($scope.effect.slotnames == null) {
            $scope.effect.slotnames = [];
        }    
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
                url: 'http://127.0.0.1:11180/api/services' 
            });

            for (const slotname of response.data) 
            {
                $scope.effect.slotnames.push( { name:slotname.name , id:slotname.id});
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.slotname == null || effect.slotname.id ==="") {
            errors.push("転送先を指定してください");
        }
        
        if (effect.writerName == null || effect.writerName ==="") {
            errors.push("名前を指定してください");
        }
        return errors;
    },
    onTriggerEvent: async event => {
        const effect = event.effect;

        try {
            const {
                createHash,
            } = require('node:crypto');
            const hash = createHash('sha1');  
            hash.update(effect.writerName);
            const crypto = require("crypto");

            const sendData =  {
                "service": {
                    "id": String(effect.slotname.id),
                    "name": effect.slotname.name,
                    "write": false,
                    "speech": false,
                    "persist": false
                },
                "comment": {
                    "id": String(crypto.randomUUID()),
                    "userId": String(hash.digest('hex')),
                    "name": effect.writerName,
                    "badges": [],
                    "profileImage": "",
                    "comment": effect.message,
                    "hasGift": false,
                    "isOwner": false,
                    "timestamp": 0
                }
            };         
            
            // HTTP header
            var headers = {
                'Content-Type': 'application/json'
            };
            
            const response = await axios({
                method:'post',
                url: 'http://127.0.0.1:11180/api/comments',
                headers: headers,
                data: JSON.stringify(sendData)
            });
            
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        
        return true;
    }
};

module.exports = onecommeTransfer;
