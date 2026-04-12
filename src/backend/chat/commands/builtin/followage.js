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
        name: "繝輔か繝ｭ繝ｼ譛滄俣",
        active: true,
        trigger: "!followage",
        description: "繝ｦ繝ｼ繧ｶ繝ｼ縺後メ繝｣繝ｳ繝阪Ν繧偵ヵ繧ｩ繝ｭ繝ｼ縺励※縺・ｋ譛滄俣繧定｡ｨ遉ｺ縺励∪縺・,
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        options: {
            displayTemplate: {
                type: "string",
                title: "蜃ｺ蜉帙ユ繝ｳ繝励Ξ繝ｼ繝・,
                description: "繝輔か繝ｭ繝ｼ繝｡繝・そ繝ｼ繧ｸ縺ｮ繝輔か繝ｼ繝槭ャ繝・,
                tip: "螟画焚: {user}, {followage}, {followdate}",
                default: `{user} 縺ｯ {followage} 蜑・( {followdate} (UTC) )繧医ｊ繝輔か繝ｭ繝ｼ縺励※縺・∪縺兪,
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

        if (rawFollowDate === null) {
            await chat.sendChatMessage(`${commandSender} 縺ｯ縺薙・繝√Ε繝ｳ繝阪Ν繧偵ヵ繧ｩ繝ｭ繝ｼ縺励※縺・∪縺帙ｓ.`);
        } else {
            const followDate = DateTime.fromJSDate(rawFollowDate),
                now = DateTime.utc(),
                nowLocal = DateTime.now();

            const followAgeString = util.getDateDiffString(
                followDateMoment,
                nowMoment
            );

            await chat.sendChatMessage(commandOptions.displayTemplate
                .replace("{user}", commandSender)
                .replace("{followage}", followAgeString)
                .replace("{followdate}", nowLocal.toFormat("YYYY/MMMM/DD HH:mm"))
            );
        }
    }
};

module.exports = followage;
