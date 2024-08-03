"use strict";

const { ComparisonType } = require("../../../../shared/filter-constants");
const logger = require("../../../../logwrapper");

module.exports = {
    id: "firebot:username",
    name: "視聴者名",
    description: "特定の視聴者名にフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" },
        { eventSourceId: "twitch", eventId: "bits-badge-unlocked" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "sub" },
        { eventSourceId: "twitch", eventId: "prime-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "gift-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "follow" },
        { eventSourceId: "twitch", eventId: "raid" },
        { eventSourceId: "twitch", eventId: "viewer-arrived" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" },
        { eventSourceId: "twitch", eventId: "channel-reward-redemption" },
        { eventSourceId: "twitch", eventId: "viewer-arrived" },
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "announcement" },
        { eventSourceId: "twitch", eventId: "whisper" },
        { eventSourceId: "firebot", eventId: "view-time-update" },
        { eventSourceId: "firebot", eventId: "currency-update" },
        { eventSourceId: "firebot", eventId: "viewer-created" },
        { eventSourceId: "firebot", eventId: "viewer-rank-updated" },
        { eventSourceId: "streamloots", eventId: "purchase" },
        { eventSourceId: "streamloots", eventId: "redemption" },
        { eventSourceId: "streamlabs", eventId: "follow" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT, ComparisonType.CONTAINS, ComparisonType.MATCHES_REGEX],
    valueType: "text",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        // normalize usernames
        const eventUsername = eventMeta.username ? eventMeta.username.toLowerCase() : "";
        const filterUsername = value ? value.toLowerCase() : "";

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.ORG_IS:
                return eventUsername === filterUsername;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return eventUsername !== filterUsername;
            case ComparisonType.CONTAINS:
            case ComparisonType.COMPAT_CONTAINS:
            case ComparisonType.ORG_CONTAINS:
                return eventUsername.includes(filterUsername);
            case ComparisonType.MATCHES_REGEX:
            case ComparisonType.COMPAT_MATCHES_REGEX:
            case ComparisonType.ORG_MATCHES_REGEX:
            {
                const regex = new RegExp(filterUsername, "gi");
                return regex.test(eventUsername);
            }
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};