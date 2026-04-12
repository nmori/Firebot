"use strict";

const twitchChat = require("../../chat/twitch-chat");
const logger = require("../../logwrapper");
const accountAccess = require("../account-access");
const discordEmbedBuilder = require("../../integrations/builtin/discord/discord-embed-builder");
const discord = require("../../integrations/builtin/discord/discord-message-sender");
const utils = require("../../utility");

const twitchApi = require("../../twitch-api/api");
const client = twitchApi.streamerClient;

/**
 * @returns {Promise<HelixClip?>}
 */
exports.createClip = async function(effect) {

    const streamerAccount = accountAccess.getAccounts().streamer;
    const broadcast = await client.streams.getStreamByUserId(streamerAccount.userId);
    const channelId = (await twitchApi.users.getUserById(streamerAccount.userId)).id;

    // if (broadcast == null) {
    //     frontendCommunicator.send('error', `Failed to create a clip. Reason: Streamer is not live.`);
    //     return null;
    // }

    if (effect.postLink) {
        await twitchChat.sendChatMessage("繧ｯ繝ｪ繝・・菴懈・荳ｭ...");
    }

    let clipId;

    try {
        clipId = await client.clips.createClip({
            channel: channelId
        });
    } catch (err) {
        //failed to create clip
    }

    if (clipId == null) {
        if (effect.postLink) {
            await twitchChat.sendChatMessage("縺翫▲縺ｨ・√け繝ｪ繝・・縺ｮ菴懈・譎ゅ↓菴輔°蝠城｡後′逋ｺ逕溘＠縺ｾ縺励◆:(");
        }
        return null;
    }

    /**@type {import('@twurple/api').HelixClip} */
    let clip;
    let attempts = 0;
    do {
        attempts++;
        try {
            clip = await client.clips.getClipById(clipId);
        } catch (err) {
            //failed to get clip
        }
        if (clip == null) {
            await utils.wait(1000);
        }
    }
    while (clip == null && attempts < 15);

    if (clip != null) {
        if (effect.postLink) {
            const message = `繧ｯ繝ｪ繝・・縺励∪縺励◆: ${clip.url}`;
            await twitchChat.sendChatMessage(message);
        }

        if (effect.postInDiscord) {
            const clipEmbed = await discordEmbedBuilder.buildClipEmbed(clip, effect.embedColor);
            discord.sendDiscordMessage(effect.discordChannelId, "譁ｰ隕上け繝ｪ繝・・繧剃ｽ懈・縺励∪縺励◆!", clipEmbed);
        }

        logger.info("Successfully created a clip!");
    } else {
        if (effect.postLink) {
            await twitchChat.sendChatMessage("縺翫▲縺ｨ・√け繝ｪ繝・・縺ｮ菴懈・譎ゅ↓菴輔°蝠城｡後′逋ｺ逕溘＠縺ｾ縺励◆ :(");
        }
    }
    return clip;
};
