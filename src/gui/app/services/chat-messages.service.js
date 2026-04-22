"use strict";
(function() {
    const moment = require('moment');

    const { randomUUID } = require("crypto");

    angular
        .module('firebotApp')
        .factory('chatMessagesService', function (logger, settingsService,
            soundService, backendCommunicator, pronounsService, accountAccess, ngToast) {
            const service = {};

            // Chat Message Queue
            service.chatQueue = [];

            // Secondary index for O(1) lookup by chat message id (施策8).
            // Only populated for items whose `type === "message"` and have a data.id.
            // NOTE: must be kept in sync with chatQueue by all mutation sites.
            service.messagesById = new Map();

            // the number of messages to show at any given time. This helps performance
            service.chatMessageDisplayLimit = 75;

            // Pre-computed list of chat items after applying hide/limit/reverse filters (施策3).
            // Replaces the 4-stage filter chain that used to run every AngularJS digest.
            service.visibleMessages = [];

            service.recomputeVisibleMessages = function() {
                const hideBot = settingsService.getSetting("ChatHideBotAccountMessages") === true;
                const hideWhispers = settingsService.getSetting("ChatHideWhispers") === true;
                const reverseOrder = settingsService.getSetting("ChatReverseOrder") === true;
                const botUsername = accountAccess.accounts.bot && accountAccess.accounts.bot.username
                    ? accountAccess.accounts.bot.username.toLowerCase()
                    : "";

                const limit = service.chatMessageDisplayLimit;
                const queue = service.chatQueue;
                const tail = [];

                // Walk from newest to oldest, keeping up to `limit` visible items (most recent window).
                for (let i = queue.length - 1; i >= 0 && tail.length < limit; i--) {
                    const item = queue[i];
                    if (item.type === "message") {
                        const data = item.data;
                        if (data && data.isHiddenFromChatFeed === true) {
                            continue;
                        }
                        if (hideBot && botUsername && data && data.username
                            && data.username.toLowerCase() === botUsername) {
                            continue;
                        }
                        if (hideWhispers && data && data.whisper === true) {
                            continue;
                        }
                    }
                    tail.push(item);
                }

                // `tail` is newest-first. Default chat order shows newest at bottom,
                // so we reverse to oldest-first unless the user opted into reverse order.
                if (!reverseOrder) {
                    tail.reverse();
                }

                service.visibleMessages = tail;
            };

            // Chat User List
            service.chatUsers = [];

            service.autodisconnected = false;

            // The active chat sender identifier, either "Streamer" or "Bot"
            service.chatSender = "Streamer";
            // The pending but unsent outgoing chat message text
            service.messageText = "";
            // The message/thread currently being replied to
            service.threadDetails = null;

            // History of chat messages sent via Dashboard
            service.chatHistory = [];
            service.currrentHistoryIndex = -1;

            // Return the chat queue.
            service.getChatQueue = function() {
                return service.chatQueue;
            };

            // Clear Chat Queue
            service.clearChatQueue = function() {
                service.chatQueue = [];
                service.messagesById.clear();
                service.recomputeVisibleMessages();
            };

            // Return User List
            service.getChatUsers = function() {
                // Sort list so we are in alphabetical order
                const userList = service.chatUsers;
                if (userList.length > 0) {
                    userList.sort(function(a, b) {
                        return a.username.localeCompare(b.username);
                    });
                }
                return userList;
            };

            // Return User List with people in role filtered out.
            service.getFilteredChatUserList = function() {
                return service.chatUsers.filter(user => !user.disableViewerList);
            };

            // Clear User List
            service.clearUserList = function() {
                service.chatUsers = [];
            };

            // Full Chat User Refresh
            // This replaces chat users with a fresh list pulled from the backend in the chat processor file.
            service.chatUserRefresh = function(data) {
                const users = data.chatUsers.map((u) => {
                    u.id = u.userId;
                    return u;
                });
                service.chatUsers = users;
            };

            // User joined the channel.
            service.chatUserJoined = function (data) {
                if (!service.chatUsers.some(u => u.id === data.id)) {
                    service.chatUsers.push(data);
                }
            };

            // User left the channel.
            service.chatUserLeft = function(data) {
                const userId = data.id,
                    arr = service.chatUsers,
                    userList = arr.filter(x => x.id !== userId);

                service.chatUsers = userList;
            };

            service.chatUserUpdated = (user) => {
                const index = service.chatUsers.findIndex(u => u.id === user.id);
                service.chatUsers[index] = user;
            };

            // Purge Chat Message
            service.purgeChatMessages = function(data) {
                const chatQueue = service.chatQueue;

                let cachedUserName = null;
                chatQueue.forEach((message) => {
                    // If user id matches, then mark the message as deleted.
                    if (message.user_id === data.user_id) {
                        if (cachedUserName == null) {
                            cachedUserName = message.user_name;
                        }
                        message.deleted = true;

                        let modName = "a mod";
                        if (data.moderator) {
                            modName = data.moderator.user_name;
                        }
                        message.eventInfo = `Purged by ${modName}.`;

                    }
                });

                service.recomputeVisibleMessages();

                if (data.cause && cachedUserName) {
                    if (data.cause.type === "timeout") {
                        service.chatAlertMessage(`${cachedUserName} was timed out by ${data.moderator.user_name} for ${data.cause.durationString}.`);
                    } else if (data.cause.type === "ban") {
                        service.chatAlertMessage(`${cachedUserName} was banned by ${data.moderator.user_name}.`);
                    }
                }
            };

            service.highlightMessage = (username, userId, displayName, rawText, chatMessage) => {
                backendCommunicator.fireEvent("highlight-message", {
                    username: username,
                    userId: userId,
                    displayName: displayName,
                    messageText: rawText,
                    chatMessage: {
                        ...chatMessage,
                        timestamp: chatMessage.timestamp ? chatMessage.timestamp.toISOString() : null
                    }
                });
            };

            // Chat Alert Message
            service.chatAlertMessage = function(message, icon = "fad fa-exclamation-circle") {
                const alertItem = {
                    id: randomUUID(),
                    type: "alert",
                    message: message,
                    icon: icon
                };

                service.chatQueue.push(alertItem);
                service.recomputeVisibleMessages();
            };

            backendCommunicator.on("chat-feed-system-message", (message, icon) => {
                service.chatAlertMessage(message, icon);
            });

            // Custom Highlight and Banner
            service.customHighlightAndBanner = function(messageId, customHighlightColor, customBannerIcon, customBannerText) {
                const messageItem = service.messagesById.get(messageId);
                if (messageItem == null) {
                    return;
                }

                messageItem.data.customHighlightColor = customHighlightColor;
                messageItem.data.customBannerIcon = customBannerIcon;
                messageItem.data.customBannerText = customBannerText;
                service.recomputeVisibleMessages();
            };

            backendCommunicator.on("chat-feed-custom-highlight", (data) => {
                service.customHighlightAndBanner(data.messageId, data.customHighlightColor, data.customBannerIcon, data.customBannerText);
            });

            // Chat Update Handler
            // This handles all of the chat stuff that isn't a message.
            // This will only work when chat feed is turned on in the settings area.
            service.chatUpdateHandler = function(data) {
                switch (data.fbEvent) {
                    case "ClearMessages":
                        logger.info("Chat cleared");
                        service.clearChatQueue();

                        service.chatAlertMessage(`Chat has been cleared by ${data.clearer.user_name}.`);
                        break;
                    case "PurgeMessage":
                        logger.info("Chat message purged");
                        service.purgeChatMessages(data);
                        break;
                    case "UserJoin":
                        logger.debug("Chat User Joined");

                        // Standardize user roles naming.
                    data.user_roles = data.roles; // eslint-disable-line

                        service.chatUserJoined(data);
                        break;
                    case "UserLeave":
                        logger.debug("Chat User Left");

                        // Standardize user roles naming.
                    data.user_roles = data.roles; // eslint-disable-line

                        service.chatUserLeft(data);
                        break;
                    case "UserUpdate":
                        logger.debug("User updated");
                        service.chatUserUpdated(data);
                        break;
                    case "Disconnected":
                    // We disconnected. Clear messages, post alert, and then let the reconnect handle repopulation.
                        logger.info("Chat Disconnected!");
                        service.clearChatQueue();
                        service.chatAlertMessage("Chat has been disconnected.");
                        break;
                    case "UsersRefresh":
                        logger.info("Chat userlist refreshed.");
                        service.chatUserRefresh(data);
                        break;
                    case "ChatAlert":
                        logger.debug("Chat alert from backend.");
                        service.chatAlertMessage(data.message, data.icon);
                        break;
                    default:
                    // Nothing
                        logger.warn("Unknown chat event sent", data);
                }
            };

            // Prune Messages
            service.pruneChatQueue = function() {
                const arr = service.chatQueue,
                    overflowChat = arr.length - service.chatMessageDisplayLimit * 2;

                // Overflow chat is how many messages we need to remove to bring it back down
                // to service.chatMessageDisplayLimit x 2.
                if (overflowChat > 0) {

                    // Recalculate to overflow over the set display limit so we aren't pruning after every
                    // message once we hit chatMessageDisplayLimit x 2.
                    const bufferOverflowAmount = arr.length - service.chatMessageDisplayLimit;

                    // Remove the id→item index entries for the items we're about to drop (施策8).
                    for (let i = 0; i < bufferOverflowAmount; i++) {
                        const removed = arr[i];
                        if (removed && removed.data && removed.data.id) {
                            service.messagesById.delete(removed.data.id);
                        }
                    }

                    // Start at 0 in the array and delete X number of messages.
                    // The oldest messages are the first ones in the array.
                    arr.splice(0, bufferOverflowAmount);
                }
            };

            // Invalidate visibleMessages whenever the queue was mutated directly by callers.
            // Individual push/pop paths already call recomputeVisibleMessages themselves.
            service.invalidateVisibleMessages = function() {
                service.recomputeVisibleMessages();
            };

            service.getSubIcon = function() {
                return "";
            };

            service.levels = {};


            // This submits a chat message to Twitch.
            service.submitChat = function(sender, message, replyToMessageId) {
                backendCommunicator.send("send-chat-message", {
                    message: message,
                    accountType: sender,
                    replyToMessageId: replyToMessageId
                });
            };

            // Gets view count setting for ui.
            service.getChatViewerListSetting = function() {
                return settingsService.getSetting("ShowChatViewerList");
            };

            function markMessageAsDeleted(messageId) {
                const messageItem = service.messagesById.get(messageId);

                if (messageItem != null) {
                    messageItem.data.deleted = true;
                    service.recomputeVisibleMessages();
                }
            }

            service.deleteMessage = async (messageId) => {
                const result = await backendCommunicator.fireEventAsync("delete-message", messageId);
                if (result === true) {
                    markMessageAsDeleted(messageId);
                } else {
                    ngToast.create("Unable to delete chat message. Check log for more details.");
                }
            };

            backendCommunicator.on("twitch:chat:message:deleted", markMessageAsDeleted);

            function markUserMessagesAsDeleted(username) {
                service.chatQueue
                    .filter(i => i.type === "message" && i.data.username.toLowerCase() === username)
                    .map(i => i.data.id)
                    .forEach(markMessageAsDeleted);
            }

            backendCommunicator.on("twitch:chat:user:delete-messages", markUserMessagesAsDeleted);

            service.hideMessageInChatFeed = function(messageId) {
                const messageItem = service.messagesById.get(messageId);
                if (messageItem == null) {
                    return;
                }

                messageItem.data.isHiddenFromChatFeed = true;
                service.recomputeVisibleMessages();
            };

            backendCommunicator.on("chat-feed-message-hide", (data) => {
                service.hideMessageInChatFeed(data.messageId);
            });

            backendCommunicator.on("twitch:chat:rewardredemption", (redemption) => {
                if (service.chatQueue && service.chatQueue.length > 0) {
                    const lastQueueItem = service.chatQueue[service.chatQueue.length - 1];
                    if (!lastQueueItem.rewardMatched &&
                            lastQueueItem.type === "message" &&
                            lastQueueItem.data.customRewardId != null &&
                            lastQueueItem.data.customRewardId === redemption.reward.id &&
                            lastQueueItem.data.userId === redemption.user.id) {
                        lastQueueItem.rewardMatched = true;
                        lastQueueItem.data.reward = redemption.reward;
                        return;
                    }
                }

                service.chatQueue.push({
                    id: randomUUID(),
                    type: "redemption",
                    data: redemption
                });
                service.recomputeVisibleMessages();
            });

            backendCommunicator.on("twitch:chat:user-joined", (user) => {
                service.chatUserJoined(user);
            });

            backendCommunicator.on("twitch:chat:user-left", (id) => {
                service.chatUserLeft(({ id }));
            });

            backendCommunicator.on("twitch:chat:user-updated", (user) => {
                service.chatUserUpdated(user);
            });

            backendCommunicator.on("twitch:chat:clear-user-list", () => {
                service.clearUserList();
            });

            function findMessageByIdOrHeldId(messageId) {
                // Fast path: direct id index (施策8)
                const direct = service.messagesById.get(messageId);
                if (direct != null) {
                    return direct;
                }
                // Fallback: automod-held messages may be updated by their held id.
                return service.chatQueue.find(i => i.type === "message" &&
                    i.data.autoModHeldMessageId === messageId
                );
            }

            backendCommunicator.on("twitch:chat:automod-update", ({ messageId, newStatus, resolverName }) => {

                const messageItem = findMessageByIdOrHeldId(messageId);

                if (messageItem == null) {
                    return;
                }

                messageItem.data.autoModStatus = newStatus;
                messageItem.data.autoModResolvedBy = resolverName;
                service.recomputeVisibleMessages();
            });

            backendCommunicator.on("twitch:chat:automod-update-error", ({ messageId, likelyExpired }) => {
                const messageItem = findMessageByIdOrHeldId(messageId);

                if (messageItem == null) {
                    return;
                }

                messageItem.data.autoModErrorMessage = `There was an error acting on this message. ${likelyExpired ? "The time to act has likely expired." : "You may need to reauth your Streamer account."}`;
                service.recomputeVisibleMessages();
            });

            backendCommunicator.on("twitch:chat:clear-feed", (modUsername) => {
                const clearMode = settingsService.getSetting("ClearChatFeedMode");

                const isStreamer = accountAccess.accounts.streamer.username.toLowerCase()
                    === modUsername.toLowerCase();

                if (clearMode !== "never" && (clearMode === "always" || isStreamer)) {
                    service.clearChatQueue();
                }

                service.chatAlertMessage(`${modUsername} cleared the chat.`);
            });

            backendCommunicator.on("twitch:chat:user-active", (id) => {
                const user = service.chatUsers.find(u => u.id === id);
                if (user != null) {
                    user.active = true;
                }
            });

            backendCommunicator.on("twitch:chat:user-inactive", (id) => {
                const user = service.chatUsers.find(u => u.id === id);
                if (user != null) {
                    user.active = false;
                }
            });

            backendCommunicator.on("twitch:chat:autodisconnected", (autodisconnected) => {
                service.autodisconnected = autodisconnected;
            });

            backendCommunicator.on("twitch:chat:message", (chatMessage) => {

                if (chatMessage.tagged) {
                    soundService.playChatNotification();
                }
                if (chatMessage.isAutoModHeld === true) {
                    setTimeout(() => {
                        if (chatMessage.autoModStatus === "pending") {
                            chatMessage.autoModStatus = "expired";
                        }
                    }, 5 * 60 * 1000);
                }

                pronounsService.getUserPronoun(chatMessage.username);

                const now = moment();
                chatMessage.timestamp = now;
                chatMessage.timestampDisplay = now.format('h:mm A');

                if (chatMessage.profilePicUrl == null) {
                    chatMessage.profilePicUrl = "../images/placeholders/default-profile-pic.png";
                }

                const user = service.chatUsers.find(u => u.id === chatMessage.userId);
                if (user && user.roles.length !== chatMessage.roles.length) {
                    user.roles = chatMessage.roles;
                    service.chatUserUpdated(user);
                }

                // when an automod held message is approved, the message is sent again,
                // attempt to merge it with the existing message.
                // 施策8: use numeric timestamp comparison (no per-iter moment() allocation).
                const nowMs = Date.now();
                const existingAutoModMessageIndex = service.chatQueue.findIndex(i =>
                    i.type === "message" &&
                    i.data.isAutoModHeld &&
                    i.data.autoModHeldMessageId == null &&
                    i.data.rawText === chatMessage.rawText &&
                    i.data.userId === chatMessage.userId &&
                    (nowMs - (i.data.timestamp && typeof i.data.timestamp.valueOf === "function"
                        ? i.data.timestamp.valueOf()
                        : +i.data.timestamp || 0)) <= 5 * 60 * 1000
                );
                const existingAutoModMessage = service.chatQueue[existingAutoModMessageIndex]?.data;
                if (existingAutoModMessage != null) {
                    // merge the new message with the existing one
                    chatMessage = {
                        ...existingAutoModMessage,
                        ...chatMessage,
                        autoModHeldMessageId: existingAutoModMessage.id,
                        isAutoModHeld: existingAutoModMessage.isAutoModHeld,
                        autoModStatus: existingAutoModMessage.autoModStatus,
                        autoModResolvedBy: existingAutoModMessage.autoModResolvedBy,
                        autoModErrorMessage: existingAutoModMessage.autoModErrorMessage
                    };
                    // remove the existing automod message from the queue
                    const removedItem = service.chatQueue[existingAutoModMessageIndex];
                    service.chatQueue.splice(existingAutoModMessageIndex, 1);
                    if (removedItem && removedItem.data && removedItem.data.id) {
                        service.messagesById.delete(removedItem.data.id);
                    }
                }

                // Push new message to queue.
                const messageItem = {
                    id: randomUUID(),
                    type: "message",
                    data: chatMessage
                };

                if (chatMessage.customRewardId != null &&
                        service.chatQueue &&
                        service.chatQueue.length > 0) {
                    const lastQueueItem = service.chatQueue[service.chatQueue.length - 1];
                    if (lastQueueItem.type === "redemption" &&
                            lastQueueItem.data.reward.id === chatMessage.customRewardId &&
                            lastQueueItem.data.user.id === chatMessage.userId) {
                        messageItem.rewardMatched = true;
                    }
                }

                service.chatQueue.push(messageItem);
                if (messageItem.data && messageItem.data.id) {
                    service.messagesById.set(messageItem.data.id, messageItem);
                }

                service.pruneChatQueue();
                service.recomputeVisibleMessages();
            });

            service.allEmotes = {
                streamer: [],
                bot: [],
                thirdParty: []
            };

            service.filteredEmotes = {
                streamer: [],
                bot: [],
                thirdParty: []
            };

            service.refreshEmotes = () => {
                const showBttvEmotes = settingsService.getSetting("ChatShowBttvEmotes");
                const showFfzEmotes = settingsService.getSetting("ChatShowFfzEmotes");
                const showSevenTvEmotes = settingsService.getSetting("ChatShowSevenTvEmotes");

                service.filteredEmotes = {
                    streamer: service.allEmotes.streamer,
                    bot: service.allEmotes.bot,
                    thirdParty: service.allEmotes.thirdParty.filter((e) => {
                        if (showBttvEmotes !== true && e.origin === "BTTV") {
                            return false;
                        }

                        if (showFfzEmotes !== true && e.origin === "FFZ") {
                            return false;
                        }

                        if (showSevenTvEmotes !== true && e.origin === "7TV") {
                            return false;
                        }

                        return true;
                    })
                };
            };

            backendCommunicator.on("all-emotes", (emotes) => {
                service.allEmotes = emotes;
                service.refreshEmotes();
            });

            // Watches for an chat update from main process
            // This handles clears, deletions, timeouts, etc... Anything that isn't a message.
            backendCommunicator.on("chatUpdate", service.chatUpdateHandler);

            return service;
        });
}());
