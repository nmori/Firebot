"use strict";

const frontendCommunicator = require("../../common/frontend-communicator");
const commandHandler = require("../commands/commandHandler");
const chatHelpers = require("../chat-helpers");
const activeUserHandler = require("./active-user-handler");
const accountAccess = require("../../common/account-access");
const chatModerationManager = require("../moderation/chat-moderation-manager");
const twitchEventsHandler = require("../../events/twitch-events");
const raidMessageChecker = require(".././moderation/raid-message-checker");
const logger = require("../../logwrapper");

const events = require("events");

exports.events = new events.EventEmitter();

/** @arg {import('@twurple/chat').ChatClient} botChatClient */
exports.setupBotChatListeners = (botChatClient) => {
    botChatClient.onWhisper(async (_user, messageText, msg) => {
        const firebotChatMessage = await chatHelpers.buildFirebotChatMessage(msg, messageText, true);
        commandHandler.handleChatMessage(firebotChatMessage);
    });
};

const HIGHLIGHT_MESSAGE_REWARD_ID = "highlight-message";

/** @arg {import('@twurple/chat').ChatClient} streamerChatClient */
exports.setupChatListeners = (streamerChatClient) => {

    streamerChatClient.onAnnouncement(async (_channel, _user, announcementInfo, msg) => {
        const firebotChatMessage = await chatHelpers.buildFirebotChatMessage(msg, msg.message.value);

        firebotChatMessage.isAnnouncement = true;
        firebotChatMessage.announcementColor = announcementInfo.color ?? "PRIMARY";

        frontendCommunicator.send("twitch:chat:message", firebotChatMessage);

        twitchEventsHandler.announcement.triggerAnnouncement(
            firebotChatMessage.useridname,
            firebotChatMessage.userId,
            firebotChatMessage.displayName,
            firebotChatMessage.roles,
            firebotChatMessage.rawText
        );
    });

    streamerChatClient.onMessage(async (_channel, user, messageText, msg) => {
        const firebotChatMessage = await chatHelpers.buildFirebotChatMessage(msg, messageText);

        await chatModerationManager.moderateMessage(firebotChatMessage);

        // send to the frontend
        if (firebotChatMessage.isHighlighted) {
            firebotChatMessage.customRewardId = HIGHLIGHT_MESSAGE_REWARD_ID;
            frontendCommunicator.send("twitch:chat:rewardredemption", {
                id: HIGHLIGHT_MESSAGE_REWARD_ID,
                messageText: firebotChatMessage.rawText,
                user: {
                    id: firebotChatMessage.userId,
                    userIdName: firebotChatMessage.useridname,
                    username: firebotChatMessage.useridname,
                    displayName:firebotChatMessage.displayName
                },
                reward: {
                    id: HIGHLIGHT_MESSAGE_REWARD_ID,
                    name: "ハイライト",
                    cost: 0,
                    imageUrl: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-4.png"
                }
            });
        }
        frontendCommunicator.send("twitch:chat:message", firebotChatMessage);
        exports.events.emit("chat-message", firebotChatMessage);

        commandHandler.handleChatMessage(firebotChatMessage);

        activeUserHandler.addActiveUser(msg.userInfo, true);

        twitchEventsHandler.viewerArrived.triggerViewerArrived(msg.userInfo.displayName, msg.userInfo.userName, msg.userInfo.userId, messageText);

        const { streamer, bot } = accountAccess.getAccounts();
        if (user !== streamer.username && user !== bot.username) {
            const timerManager = require("../../timers/timer-manager");
            timerManager.incrementChatLineCounters();
        }

        twitchEventsHandler.chatMessage.triggerChatMessage(firebotChatMessage);
        await raidMessageChecker.sendMessageToCache(firebotChatMessage);
    });

    streamerChatClient.onWhisper(async (_user, messageText, msg) => {
        const firebotChatMessage = await chatHelpers.buildFirebotChatMessage(msg, messageText, true);

        commandHandler.handleChatMessage(firebotChatMessage);

        frontendCommunicator.send("twitch:chat:message", firebotChatMessage);
    });

    streamerChatClient.onAction(async (_channel, _user, messageText, msg) => {
        const firebotChatMessage = await chatHelpers.buildFirebotChatMessage(msg, messageText, false, true);
        frontendCommunicator.send("twitch:chat:message", firebotChatMessage);

        twitchEventsHandler.chatMessage.triggerChatMessage(firebotChatMessage);

        twitchEventsHandler.viewerArrived.triggerViewerArrived(msg.userInfo.displayName, msg.userInfo.userName, msg.userInfo.userId, messageText);
    });

    streamerChatClient.onMessageRemove((_channel, messageId) => {
        frontendCommunicator.send("twitch:chat:message:deleted", messageId);
    });

    streamerChatClient.onResub(async (_channel, _user, subInfo, msg) => {
        try {
            if (subInfo.originalGiftInfo != null) {
                twitchEventsHandler.sub.triggerSub(
                    msg.userInfo.userName,
                    subInfo.userId,
                    subInfo.displayName,
                    subInfo.plan,
                    subInfo.months || 1,
                    subInfo.message ?? "",
                    subInfo.streak || 1,
                    false,
                    true
                );
            }
        } catch (error) {
            logger.error("Failed to parse resub message (multi-month gifted sub)", error);
        }

        try {
            if (subInfo.message != null && subInfo.message.length > 0) {
                const firebotChatMessage = await chatHelpers.buildFirebotChatMessage(msg, subInfo.message);

                frontendCommunicator.send("twitch:chat:message", firebotChatMessage);

                exports.events.emit("chat-message", firebotChatMessage);
            }
        } catch (error) {
            logger.error("Failed to parse resub message", error);
        }
    });

    streamerChatClient.onCommunitySub((_channel, _user, subInfo) => {
        twitchEventsHandler.giftSub.triggerCommunitySubGift(
            subInfo.gifterUserName ?? "anonymous",
            subInfo.gifterDisplayName ?? "匿名",
            subInfo.plan,
            subInfo.count
        );
    });

    streamerChatClient.onSubGift((_channel, _user, subInfo) => {
        twitchEventsHandler.giftSub.triggerSubGift(
            subInfo.gifterUserName ?? "anonymous",
            subInfo.gifterDisplayName ?? "匿名",
            subInfo.gifter,
            subInfo.gifterUserId,
            !subInfo.gifterUserId,
            subInfo.displayName,
            subInfo.plan,
            subInfo.giftDuration,
            subInfo.months,
            subInfo.streak ?? 1
        );
    });

    streamerChatClient.onGiftPaidUpgrade((_channel, _user, subInfo, msg) => {
        twitchEventsHandler.giftSub.triggerSubGiftUpgrade(
            msg.userInfo.userName,
            subInfo.displayName,
            subInfo.userId,
            subInfo.gifterDisplayName,
            subInfo.plan
        );
    });

    streamerChatClient.onPrimePaidUpgrade((_channel, _user, subInfo, msg) => {
        twitchEventsHandler.sub.triggerPrimeUpgrade(
            msg.userInfo.userName,
            subInfo.displayName,
            subInfo.userId,
            subInfo.plan
        );
    });

    streamerChatClient.onRaid((_channel, _username, raidInfo, msg) => {
        twitchEventsHandler.raid.triggerRaid(
            msg.userInfo.userName,
            msg.userInfo.userId,
            raidInfo.displayName,
            raidInfo.viewerCount
        );
    });
};