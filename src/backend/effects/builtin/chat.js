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
        <textarea ng-model="effect.message" class="form-control" name="text" placeholder="メッセージの入力" rows="4" cols="40" replace-variables></textarea>
        <div style="color: #fb7373;" ng-if="effect.message && effect.message.length > 500">チャットメッセージは500文字を超えることはできません。このメッセージは、すべての置換変数が入力された後、長すぎる場合は自動的に複数のメッセージに分割されます。</div>
        <div style="display: flex; flex-direction: row; width: 100%; height: 36px; margin: 10px 0 10px; align-items: center;">
            <label class="control-fb control--checkbox" style="margin: 0px 15px 0px 0px"> ささやく
                <input type="checkbox" ng-init="whisper = (effect.whisper != null && effect.whisper !== '')" ng-model="whisper" ng-click="effect.whisper = ''">
                <div class="control__indicator"></div>
            </label>
            <div ng-show="whisper">
                <div class="input-group">
                    <span class="input-group-addon" id="chat-whisper-effect-type">To</span>
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

    `,
    optionsController: () => {},
    optionsValidator: effect => {
        const errors = [];
        if (effect.message == null || effect.message === "") {
            errors.push("チャットメッセージを空白にすることはできません。");
        }
        return errors;
    },
    onTriggerEvent: async ({ effect, trigger}) => {

        const chatHelpers = require("../../chat/chat-helpers");

        const commandHandler = require("../../chat/commands/commandHandler");

        let messageId = null;
        if (trigger.type === EffectTrigger.COMMAND) {
            messageId = trigger.metadata.chatMessage.id;
        } else if (trigger.type === EffectTrigger.EVENT) {
            messageId = trigger.metadata.eventData?.chatMessage?.id;
        }

        await twitchChat.sendChatMessage(effect.message, effect.whisper, effect.chatter, !effect.whisper && effect.sendAsReply ? messageId : undefined);

        if (effect.chatter === "Streamer" && (effect.whisper == null || !effect.whisper.length)) {
            const firebotMessage = await chatHelpers.buildStreamerFirebotChatMessageFromText(effect.message);
            commandHandler.handleChatMessage(firebotMessage);
        }

        return true;
    }
};

module.exports = effect;
