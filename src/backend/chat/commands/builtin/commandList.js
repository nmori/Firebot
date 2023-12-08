"use strict";

/**
 * The Command List command
 */
const commandList = {
    definition: {
        id: "firebot:commandlist",
        name: "コマンドリスト",
        active: true,
        trigger: "!commands",
        description: "利用可能なすべてのコマンドを含むプロフィールページへのリンクを表示します",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        }
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: async event => {
        const cloudSync = require('../../../cloud-sync/profile-sync.js');
        const twitchChat = require("../../../chat/twitch-chat");

        const profileJSON = {
            username: event.chatMessage.username,
            userRoles: event.chatMessage.roles,
            profilePage: 'commands'
        };

        const binId = await cloudSync.syncProfileData(profileJSON);

        if (binId == null) {
            await twitchChat.sendChatMessage(
                `${event.chatMessage.username}, 実行が許可されているコマンドはありません`, null, "Bot");
        } else {
            await twitchChat.sendChatMessage(
                `コマンドのリストはここで見ることができます： https://firebot.app/profile?id=${binId}`, null, "Bot");
        }
    }
};

module.exports = commandList;
