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

    if (broadcast == null) {
        renderWindow.webContents.send('error', `クリップの作成に失敗しました。配信中ではないためです。`);
        return null;
    }

    if (effect.postLink) {
        await twitchChat.sendChatMessage("クリップ作成中...");
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
            await twitchChat.sendChatMessage("おっと！クリップの作成時に何か問題が発生しました:(");
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
            const message = `クリップしました: ${clip.url}`;
            await twitchChat.sendChatMessage(message);
        }

        if (effect.postInDiscord) {
            const clipEmbed = await discordEmbedBuilder.buildClipEmbed(clip, effect.embedColor);
            discord.sendDiscordMessage(effect.discordChannelId, "新規クリップを作成しました!", clipEmbed);
        }

        logger.info("Successfully created a clip!");
    } else {
        if (effect.postLink) {
            await twitchChat.sendChatMessage("おっと！クリップの作成時に何か問題が発生しました :(");
        }
    }
    return clip;
};