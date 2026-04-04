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

const onecommeTransfer = {
    definition: {
        id: "firebot:onecomme-transfer",
        name: "わんコメに転送",
        description: "指定した文章をわんコメに転送します",
        icon: "fad fa-paw",
        categories: [EffectCategory.JP_ORIGINAL],
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
        <textarea ng-model="effect.writerName" class="form-control" name="text" placeholder="名前の入力" rows="1" cols="40" replace-variables></textarea>
    </eos-container>
    <eos-container header="メッセージ" pad-top="true">
        <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
    </eos-container>
        
    `,
    optionsController: async ($scope) => {

        $scope.effect.slotnames = [];

        try {

            let headers = {
                'Content-Type': 'application/json'
            };

            const response = await fetch(
                'http://127.0.0.1:11180/api/services',
                {
                    method: 'GET',
                    headers: headers
                });

            let responseData = JSON.parse(await response.text());

            for (const slotname of responseData) {
                $scope.effect.slotnames.push({ name: slotname.name, id: slotname.id });
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.slotname == null || effect.slotname.id === "") {
            errors.push("転送先を指定してください");
        }

        if (effect.writerName == null || effect.writerName === "") {
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

            const sendData = {
                "service": {
                    "id": String(effect.slotname.id),
                    "name": effect.slotname.name,
                    "write": true,
                    "speech": true,
                    "persist": true
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


            const response = await fetch(
                'http://localhost:11180/api/comments',
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(sendData)
                });

            let responseData = await response.text();

        } catch (error) {
            logger.error("Error running http request", error.message);
        }


        return true;
    }
};

module.exports = onecommeTransfer;
