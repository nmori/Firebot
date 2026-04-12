"use strict";


const logger = require("../../logwrapper");
const { EffectCategory } = require('../../../shared/effect-constants');
const twitchChat = require("../../chat/twitch-chat");

const playSound = {
    definition: {
        id: "firebot:gpt-yncneo",
        name: "ゆかコネNEO経由でAIと会話",
        description: "ゆかコネNEOをつかってAIを使った会話をします",
        icon: "fad fa-waveform",
        categories: [EffectCategory.JP_ORIGINAL],
        dependencies: []
    },
    globalSettings: {},
    optionsTemplate: `
  
        <eos-container header="設定" pad-top="true">
            <textarea ng-model="effect.premise" class="form-control" name="text" placeholder="キャラ設定の入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>
        <eos-container header="問い（プロンプト）" pad-top="true">
            <textarea ng-model="effect.prompt" class="form-control" name="text" placeholder="質問の入力" rows="4" cols="40" replace-variables></textarea>
        </eos-container>
        <eos-chatter-select effect="effect" title="返信アカウント"></eos-chatter-select>

        <eos-container header="返信メッセージ" pad-top="true">
            <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
            <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">チャットメッセージは500文字を超えることはできません。このメッセージは、すべての置換変数が入力された後、長すぎる場合は自動的に複数のメッセージに分割されます。</div>
            <p class="muted" style="font-size: 11px;"><b>返答内容:</b> {replyMessage} </p>
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
            <p ng-show="whisper" class="muted" style="font-size:11px;"><b>ヒント:</b> 関連するユーザ名をささやくには、<b>$user</b>をささやき声フィールドに入れます。</p>
            <div ng-hide="whisper">
                <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> 返信として送る<tooltip text="'返信はコマンドまたはチャットメッセージイベント内でのみ機能します。'"></tooltip>
                    <input type="checkbox" ng-model="effect.sendAsReply">
                    <div class="control__indicator"></div>
                </label>
            </div>
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
            <p class="help-block">ゆかりネットコネクターNEO v2.1～の翻訳/発話連携プラグインとGPTプラグインが必要です。</p>
        </div>

        <eos-overlay-instance ng-if="effect.audioOutputDevice && effect.audioOutputDevice.deviceId === 'overlay'" effect="effect" pad-top="true"></eos-overlay-instance>
        
    `,
    optionsController: async ($scope) => {

        $scope.successEffectsUpdated = async (effects) => {

        };

        if ($scope.effect.port == null || $scope.effect.port === "") {
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
    onTriggerEvent: async ({ effect, trigger }) => {

        try {
            const { EffectTrigger } = require("../../../shared/effect-constants");
            const chatHelpers = require("../../chat/chat-helpers");
            const commandHandler = require("../../chat/commands/commandHandler");

            const crypto = require("crypto");

            const voiceQuery = {
                operation: 'gpt',
                params: [
                    {
                        id: crypto.randomUUID(),
                        command: "question",
                        premise: effect.premise,
                        prompt: effect.prompt,
                        maxtokens: 1000,
                        temperature: 0.5
                    }
                ]
            };

            const response = await fetch(
                `http://127.0.0.1:${effect.port}/`,
                {
                    method: 'POST',
                    header: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(voiceQuery)
                }
            );

            let responseData = JSON.parse(await response.text());

            if (effect.status === 'success') {
                let messageId = null;
                if (trigger.type === EffectTrigger.COMMAND) {
                    messageId = trigger.metadata.chatMessage.id;
                } else if (trigger.type === EffectTrigger.EVENT) {
                    messageId = trigger.metadata.eventData?.chatMessage?.id;
                }

                const message = effect.message
                    .replace("{replyMessage}", response.text);

                await twitchChat.sendChatMessage(message, effect.whisper, effect.chatter, !effect.whisper && effect.sendAsReply ? messageId : undefined);

                if (effect.chatter === "Streamer" && (effect.whisper == null || !effect.whisper.length)) {
                    const firebotMessage = await chatHelpers.buildStreamerFirebotChatMessageFromText(message);
                    commandHandler.handleChatMessage(firebotMessage);
                }
            }
        } catch (error) {
            logger.error("Error running http request", error.message);
        }

        return true;
    },
};

module.exports = playSound;
