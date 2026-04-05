"use strict";
const EventEmitter = require("events");

const { EffectManager } = require("../../../effects/effect-manager");

const integrationDefinition = {
    id: "discord",
    name: "Discord",
    description: "Discordチャンネルにメッセージを送信します。",
    linkType: "none",
    connectionToggle: false,
    configurable: true,
    settingCategories: {
        webhookSettings: {
            title: "チャンネル設定",
            sortRank: 2,
            settings: {
                channels: {
                    title: "保存済みチャンネル",
                    description: "Firebotがメッセージを投稿できるチャンネル名とWebhook URLの一覧です。",
                    type: "discord-channel-webhooks",
                    sortRank: 1
                }
            }
        },
        botOverrides: {
            title: "Bot上書き設定",
            sortRank: 1,
            settings: {
                botName: {
                    title: "Bot名",
                    description: "DiscordでWebhookに設定したBot名を上書きします。空欄の場合はDiscord側の設定名を使用します。",
                    type: "string",
                    tip: "任意",
                    sortRank: 1
                },
                botImageUrl: {
                    title: "Bot画像URL",
                    description: "投稿時のBotアバター画像を上書きします。空欄の場合はDiscord側のWebhookプロフィール画像を使用します。",
                    type: "string",
                    tip: "任意",
                    sortRank: 2
                }
            }
        }
    }
};

class DiscordIntegration extends EventEmitter {
    constructor() {
        super();
    }
    init() {
        EffectManager.registerEffect(require('./send-discord-message-effect'));
    }
}

module.exports = {
    definition: integrationDefinition,
    integration: new DiscordIntegration()
};
