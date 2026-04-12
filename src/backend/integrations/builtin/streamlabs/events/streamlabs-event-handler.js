"use strict";

const { EventManager } = require("../../../../events/event-manager");

const EVENT_SOURCE_ID = "streamlabs";
const EventId = {
    DONATION: "donation",
    EXTRA_LIFE_DONATION: "eldonation",
    FOLLOW: "follow"
};

const eventSourceDefinition = {
    id: EVENT_SOURCE_ID,
    name: "Streamlabs",
    description: "Streamlabs 由来の寄付関連イベント",
    events: [
        {
            id: EventId.DONATION,
            name: "寄付",
            description: "誰かが Streamlabs 経由であなたに寄付したとき。",
            cached: false,
            manualMetadata: {
                from: "StreamLabs",
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
            id: EventId.EXTRA_LIFE_DONATION,
            name: "Extra Life 寄付",
            description: "誰かがあなたの Extra Life キャンペーンへ寄付したとき。",
            cached: false,
            manualMetadata: {
                from: "Extra Life",
                formattedDonationAmount: 5,
                donationAmount: 5,
                donationMessage: "テストメッセージ"
            },
            isIntegration: true,
            activityFeed: {
                icon: "fad fa-money-bill",
                getMessage: (eventData) => {
                    return `**${eventData.from}** が Extra Life に **${eventData.formattedDonationAmount}** を寄付${eventData.donationMessage && !!eventData.donationMessage.length ? `: *${eventData.donationMessage}*` : ''}`;
                }
            }
        },
        {
            id: EventId.FOLLOW,
            name: "フォロー",
            description: "誰かがあなたの Twitch チャンネルをフォローしたとき（Streamlabs 経由）。",
            cacheMetaKey: "username",
            cached: true,
            manualMetadata: {
                username: "StreamLabs"
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

exports.processStreamLabsEvent = (eventData) => {
    if (eventData === null) {
        return;
    }
    if (eventData.type === "donation") {
        const donoData = eventData.message[0];
        EventManager.triggerEvent(EVENT_SOURCE_ID, EventId.DONATION, {
            formattedDonationAmount: donoData.formatted_amount,
            donationAmount: donoData.amount,
            donationMessage: donoData.message,
            from: donoData.from
        });
    } else if (eventData.type === "eldonation") {
        const donoData = eventData.message[0];
        EventManager.triggerEvent(
            EVENT_SOURCE_ID,
            EventId.EXTRA_LIFE_DONATION,
            {
                formattedDonationAmount: donoData.formatted_amount,
                donationAmount: donoData.amount,
                donationMessage: donoData.message,
                from: donoData.from
            }
        );
    } else if (eventData.type === "follow" && eventData.for === 'twitch_account') {
        for (const message of eventData.message) {
            EventManager.triggerEvent(
                EVENT_SOURCE_ID,
                EventId.FOLLOW,
                {
                    username: message.name,
                    userId: message.id
                }
            );
        }
    }
};