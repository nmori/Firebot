"use strict";

const { EffectCategory, EffectTrigger, EffectDependency } = require('../../../shared/effect-constants');
const twitchChat = require("../../chat/twitch-chat");

const effect = {
    definition: {
        id: "firebot:chat",
        name: "チャット",
        description: "チャットメッセージを送る",
        icon: "fad fa-comment-lines",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED, EffectCategory.TWITCH],
        dependencies: [EffectDependency.CHAT]
    },
    optionsTemplate: `
    <eos-chatter-select effect="effect" title="送信アカウント"></eos-chatter-select>

    <eos-container header="送信メッセージ" pad-top="true">
        <firebot-input 
            model="effect.message" 
            use-text-area="true"
            placeholder-text="メッセージの入力"
            rows="4"
            cols="40"
        />
        <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">チャットメッセージは500文字を超えることはできません。このメッセージは、すべての置換変数が入力された後、長すぎる場合は自動的に複数のメッセージに分割されます。</div>
        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
            <firebot-checkbox 
                label="'/me'を使う" 
                tooltip="ささやくとき、チャットをイタリック表示します。" 
                model="effect.me"
                style="margin: 0px 15px 0px 0px"
            />
            <firebot-checkbox 
                label="ささやく"
                model="showWhisperInput"
                style="margin: 0px 15px 0px 0px"
                ng-click="effect.whisper = ''"
            />
            <div ng-show="showWhisperInput">
                <firebot-input 
                    input-title="To"
                    model="effect.whisper" 
                    placeholder-text="宛先"
                />
            </div>
        </div>
        <p ng-show="whisper" class="muted" style="font-size:11px;"><b>ヒント:</b> 関連するユーザーをささやくには、<b>$user</b>をささやき声フィールドに入れます。</p>
        <div ng-hide="effect.whisper">
            <firebot-checkbox 
                label="返信として送る" 
                tooltip="返信はコマンドまたはチャットメッセージイベント内でのみ機能します。" 
                model="effect.sendAsReply"
                style="margin: 0px 15px 0px 0px"
            />
        </div>
    </eos-container>

    `,
    optionsController: ($scope) => {
        $scope.showWhisperInput = $scope.effect.whisper != null && $scope.effect.whisper !== '';
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.message == null || effect.message === "") {
            errors.push("チャットメッセージを空白にすることはできません。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger}) => {
        let messageId = null;
        if (trigger.type === EffectTrigger.COMMAND) {
            messageId = trigger.metadata.chatMessage.id;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageId = trigger.metadata.eventData?.chatMessage?.id;
        }

        if (effect.me) {
            effect.message = `/me ${effect.message}`;
        }

        await twitchChat.sendChatMessage(effect.message, effect.whisper, effect.chatter, !effect.whisper && effect.sendAsReply ? messageId : undefined);

        return true;
    }

};

module.exports = effect;
