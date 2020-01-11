"use strict";

/**
 * The firebot event source
 */
const mixerEventSource = {
    id: "mixer",
    name: "Mixer",
    description: "Events like Follow, Host, Subscribe and more from Mixer",
    events: [
        {
            id: "subscribed",
            name: "Subscribed",
            description: "When someone initially subscribes to your channel.",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot",
                totalMonths: 0
            }
        },
        {
            id: "resub",
            name: "Resubscribed",
            description: "When someone resubscribes to your channel.",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot",
                totalMonths: 6,
                shared: false
            }
        },
        {
            id: "hosted",
            name: "Hosted",
            description: "When someone hosts your channel.",
            cached: true,
            queued: false,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "followed",
            name: "Followed",
            description: "When someone follows your channel.",
            cached: true,
            queued: false,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "Firebot",
                userId: 0
            }
        },
        {
            id: "chat-message",
            name: "Chat Message",
            description: "When someone chats in your channel",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "viewer-arrived",
            name: "Viewer Arrived",
            description: "When someone actively joins your stream. Triggers on first chat message (cached).",
            cached: true,
            queued: false,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "user-joined-chat",
            name: "User Joined Chat",
            description: "When someone joins your channel's chat",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "user-left-chat",
            name: "User Left Chat",
            description: "When someone leaves your channel's chat",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "poll-started",
            name: "Poll Started",
            description: "When a poll is started",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "poll-ended",
            name: "Poll Ended",
            description: "When a poll has ended",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "message-deleted",
            name: "Message Deleted",
            description: "When a message is deleted",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "messages-purged",
            name: "Messages Purged",
            description: "When a messages from a user are purged",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "chat-cleared",
            name: "Chat Cleared",
            description: "When your channel's chat is cleared",
            cached: false,
            queued: false
        },
        {
            id: "user-banned",
            name: "User Banned",
            description: "When a user is banned from chat.",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "skill",
            name: "Skill Used",
            description: "When viewer uses a Mixer Skill (Sticker, Effect, etc).",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "patronage-milestone",
            name: "Spark Patronage Milestone",
            description: "When the channel reaches a spark patronage milestone",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot"
            }
        }
    ]
};

module.exports = mixerEventSource;
