"use strict";
const EventEmitter = require("events");

const effectManager = require("../../../effects/effectManager");

const integrationDefinition = {
    id: "discord",
    name: "Discord",
    description: "Discord チャンネルにメッセージを送る",
    linkType: "none",
    connectionToggle: false,
    configurable: true,
    settingCategories: {
        webhookSettings: {
            title: "チャンネル設定",
            sortRank: 2,
            settings: {
                channels: {
                    title: "チャンネルを保存",
                    description: "Firebotがメッセージを投稿できるチャンネル名とWebhook URLのコレクション",
                    type: "discord-channel-webhooks",
                    sortRank: 1
                }
            }
        },
        botOverrides: {
            title: "Bot設定の上書き",
            sortRank: 1,
            settings: {
                botName: {
                    title: "Botの名前",
                    description: "これは Discord で webhook に設定したボット名を上書きします。空のままだと、Discord で webhook に設定した名前が使用されます。",
                    type: "string",
                    tip: "任意",
                    sortRank: 1
                },
                botImageUrl: {
                    title: "BotのイメージURL",
                    description: "これはボットの投稿画像のアバター画像を上書きします。空のままだと、Discord で webhook 用に設定したプロフィール画像が使用されます。",
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
        effectManager.registerEffect(require('./send-discord-message-effect'));
    }
}

module.exports = {
    definition: integrationDefinition,
    integration: new DiscordIntegration()
};
