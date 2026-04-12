"use strict";
const logger = require('../../../../logwrapper');
const { EventManager } = require("../../../../events/event-manager");

const EVENT_SOURCE_ID = "tipeeestream";
const EventId = {
    DONATION: "donation",
    FOLLOW: "follow"
};

const eventSourceDefinition = {
    id: EVENT_SOURCE_ID,
    name: "TipeeeStream",
    description: "TipeeeStream 由来の寄付/チップイベント",
    events: [
        {
            id: EventId.DONATION,
            name: "寄付",
            description: "誰かが TipeeeStream 経由であなたに寄付したとき。",
            cached: false,
            manualMetadata: {
                from: "TipeeeStream",
                formattedDonationAmount: 5,
                donationAmount: 5,
                donationMessage: "テストメッセージ"
            },
            isIntegration: true,
            activityFeed: {
                icon: "fad fa-money-bill",
                getMessage: (eventData) => {
                    return `**${eventData.from}** が **${eventData.formattedDonationAmount}** を寄付${eventData.donationMessage && !!eventData.donationMessage.length ? `: *${eventData.donationMessage}*` : ''}`;
                }
            }
        },
        {
            id: EventId.FOLLOW,
            name: "フォロー",
            description: "誰かがあなたの Twitch チャンネルをフォローしたとき（TipeeeStream 経由）。",
            cacheMetaKey: "username",
            cached: true,
            manualMetadata: {
                username: "TipeeeStream"
            },
            isIntegration: true,
            activityFeed: {
                icon: "fas fa-heart",
                getMessage: (eventData) => {
                    return `**${eventData.username}** がフォローしました`;
                }
            }
        }
    ]
};

exports.registerEvents = () => {
    EventManager.registerEventSource(eventSourceDefinition);
};

exports.processTipeeeStreamEvent = (eventData) => {
    logger.debug("Tipeee event received", eventData);
    if (eventData === null) {
        return;
    }
    if (eventData.type === "donation") {
        const donoData = eventData.parameters;
        EventManager.triggerEvent(EVENT_SOURCE_ID, EventId.DONATION, {
            formattedDonationAmount: eventData.formattedAmount,
            donationAmount: donoData.amount,
            donationMessage: donoData.formattedMessage,
            from: donoData.username
        });
    } else if (eventData.type === "follow" && eventData.origin === "twitch") {
        EventManager.triggerEvent(
            EVENT_SOURCE_ID,
            EventId.FOLLOW,
            {
                username: eventData.parameters.username
            }
        );
    }
};