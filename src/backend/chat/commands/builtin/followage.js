"use strict";

const twitchApi = require("../../../twitch-api/api");
const moment = require("moment");
const chat = require("../../twitch-chat");
const util = require("../../../utility");

/**
 * The Uptime command
 */
const followage = {
    definition: {
        id: "firebot:followage",
        name: "フォロー期間",
        active: true,
        trigger: "!followage",
        description: "ユーザーがチャンネルをフォローしている期間を表示します",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        options: {
            displayTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "フォローメッセージのフォーマット",
                tip: "変数: {user}, {followage}, {followdate}",
                default: `{user} は {followage} 前 ( {followdate} (UTC) )よりフォローしています`,
                useTextArea: true
            }
        }
    },
    /**
   * When the command is triggered
   */
    onTriggerEvent: async event => {
        const commandSender = event.userCommand.commandSender;
        const commandOptions = event.commandOptions;

        const followDate = await twitchApi.users.getFollowDateForUser(commandSender);

<<<<<<< HEAD:src/backend/chat/commands/builtin/followage.js
        if (followDate === null) {
            await chat.sendChatMessage(`${commandSender} はこのチャンネルをフォローしていません.`);
        } else {
            const followDateMoment = moment(followDate),
                nowMoment = moment();
=======
        if (rawFollowDate === null) {
            await chat.sendChatMessage(`${commandSender} はこのチャンネルをフォローしていません.`);
        } else {
            const followDate = DateTime.fromJSDate(rawFollowDate),
                now = DateTime.utc(),
                nowLocal = DateTime.now();
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/chat/commands/builtin/follow-age.ts

            const followAgeString = util.getDateDiffString(
                followDateMoment,
                nowMoment
            );

            await chat.sendChatMessage(commandOptions.displayTemplate
                .replace("{user}", commandSender)
                .replace("{followage}", followAgeString)
<<<<<<< HEAD:src/backend/chat/commands/builtin/followage.js
                .replace("{followdate}", followDateMoment.format("YYYY/MMMM/DD HH:mm"))
=======
                .replace("{followdate}", nowLocal.toFormat("YYYY/MMMM/DD HH:mm"))
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/chat/commands/builtin/follow-age.ts
            );
        }
    }
};

module.exports = followage;
