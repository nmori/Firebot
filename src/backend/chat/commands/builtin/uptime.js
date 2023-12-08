"use strict";

const util = require("../../../utility");
const chat = require("../../twitch-chat");

/**
 * The Uptime command
 */
const model = {
    definition: {
        id: "firebot:uptime",
        name: "配信時間",
        active: true,
        trigger: "!uptime",
        description: "チャットに配信している時間を表示します。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        options: {
            uptimeDisplayTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "updtimeの表示フォーマット",
                tip: "変数: {uptime}",
                default: `放送時間: {uptime}`,
                useTextArea: true
            }
        }
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: async event => {
        const uptimeString = await util.getUptime();
        const { commandOptions } = event;
        await chat.sendChatMessage(commandOptions.uptimeDisplayTemplate
            .replace("{uptime}", uptimeString));
    }
};

module.exports = model;
