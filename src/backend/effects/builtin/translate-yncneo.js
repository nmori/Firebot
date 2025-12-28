"use strict";

const webServer = require("../../../server/http-server-manager");
const fs = require('fs-extra');
const logger = require("../../logwrapper");
const path = require("path");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectCategory } = require('../../../shared/effect-constants');
const { wait } = require("../../utils/async");

const voicelists = [];

const playSound = {
    definition: {
        id: "firebot:translate-yncneo",
        name: "ゆかコネNEO経由で翻訳して書き込む",
        description: "ゆかコネNEOをつかって翻訳した後チャットに書き込みます",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `

        <eos-chatter-select effect="effect" title="送信アカウント"></eos-chatter-select>

        <eos-container header="送信メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
            <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">チャットメッセージは500文字を超えることはできません。このメッセージは、すべての置換変数が入力された後、長すぎる場合は自動的に複数のメッセージに分割されます。</div>
            <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
                <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> ささやく
                    <input type="checkbox" ng-init="whisper = (effect.whisper != null && effect.whisper !== '')" ng-model="whisper" ng-click="effect.whisper = ''">
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="whisper">
                    <div class="input-group">
                        <span class="input-group-addon" id="chat-whisper-effect-type">宛先</span>
                        <input ng-model="effect.whisper" type="text" class="form-control" id="chat-whisper-setting" aria-describedby="chat-text-effect-type" placeholder="Username" replace-variables>
                    </div>
                </div>
            </div>
            <p ng-show="whisper" class="muted" style="font-size:11px;"><b>ヒント:</b> 関連するユーザーをささやくには、<b>$user</b>をささやき声フィールドに入れます。</p>
            <div ng-hide="whisper">
                <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> 返信として送る<tooltip text="'返信はコマンドまたはチャットメッセージイベント内でのみ機能します。'"></tooltip>
                    <input type="checkbox" ng-model="effect.sendAsReply">
                    <div class="control__indicator"></div>
                </label>
            </div>
        </eos-container>

        <eos-container header="翻訳先言語コード" pad-top="true">
            <textarea ng-model="effect.language" class="form-control" name="text" placeholder="言語コードを指定" rows="5" cols="10" replace-variables></textarea>
            <p class="help-block">日本語＝ja_JP、英語＝en_US</p>
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
    optionsController: async ($scope) => {
        $scope.successEffectsUpdated = async (effects) => {
            $scope.effect.successEffects = effects;
        };

    },
    optionsValidator: effect => {
        const errors = [];

        if (effect.message == null || effect.message === "") {
            effect.message = "{message_to}({language_from}>{language_to})";
            errors.push("チャットメッセージを空白にすることはできません。");
        }
        if (effect.language == null || effect.language === "") {
            effect.language = "ja_JP\nen_US";
            errors.push("翻訳言語を指定してください");
        }

        if (effect.port == null || effect.port === "") {
            effect.port = "8080";
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger }) => {

        const chatHelpers = require("../../chat/chat-helpers");
        const commandHandler = require("../../chat/commands/commandHandler");
        const twitchChat = require("../../chat/twitch-chat");
        const { EffectTrigger } = require("../../../shared/effect-constants");

        let messageId = null;
        if (trigger.type === EffectTrigger.COMMAND) {
            messageId = trigger.metadata.chatMessage.id;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageId = trigger.metadata.eventData?.chatMessage?.id;
        }

        try {
            const crypto = require("crypto");

            const translateQuery = {
                operation: 'translates',
                params: [
                    {
                        id: crypto.randomUUID(),
                        lang: [
                            effect.language.split('\n')
                        ],
                        text: effect.message
                    }
                ]
            };
            const response = await fetch(
                `http://127.0.0.1:${effect.port}/`,
                {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'POST',
                    body: JSON.stringify(translateQuery)
                });

            const responseData = JSON.parse(await response.text());
            let message = effect.message.replace("{lang}", responseData.detect_language);

            for (let i = 0; i < responseData.result.length; i++) {
                message = message.replace("{" + responseData.result[i].lang + "}", responseData.result[i].text);
            }

            await twitchChat.sendChatMessage(message, effect.whisper, effect.chatter, !effect.whisper && effect.sendAsReply ? messageId : undefined);

            if (effect.chatter === "Streamer" && (effect.whisper == null || !effect.whisper.length)) {
                const firebotMessage = await chatHelpers.buildStreamerFirebotChatMessageFromText(message);
                commandHandler.handleChatMessage(firebotMessage);
            }

        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return true;
    },
};

module.exports = playSound;
