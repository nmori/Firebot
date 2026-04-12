"use strict";

const { EventManager } = require("../../../events/event-manager");

const EVENT_SOURCE_ID = "streamelements";
const EventId = {
    DONATION: "donation",
    FOLLOW: "follow"
};

const eventSourceDefinition = {
    id: EVENT_SOURCE_ID,
    name: "StreamElements",
    description: "StreamElements 由来の寄付イベント",
    events: [
        {
            id: EventId.DONATION,
            name: "寄付",
            description: "誰かが寄付したとき。",
            cached: false,
            manualMetadata: {
                from: "StreamElements",
                donationAmount: 5,
                formattedDonationAmount: 5,
                donationMessage: "テストメッセージ"
            },
            isIntegration: true,
            activityFeed: {
                icon: "fad fa-money-bill",
                getMessage: (eventData) => {
                    return `**${eventData.from}** が **$${eventData.donationAmount}** を寄付${eventData.donationMessage && !!eventData.donationMessage.length ? `: *${eventData.donationMessage}*` : ''}`;
                }
            }
        },
        {
            id: EventId.FOLLOW,
            name: "フォロー",
            description: "誰かがあなたの Twitch チャンネルをフォローしたとき（StreamElements 経由）。",
            cacheMetaKey: "username",
            cached: true,
            manualMetadata: {
                username: "StreamElements"
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

const currencies = new Map([
    ["USD", "$"],
    ["AUD", "$"],
    ["CAD", "$"],
    ["HKD", "$"],
    ["MXN", "$"],
    ["NZD", "$"],
    ["SGD", "$"],
    ["EUR", "€"],
    ["GBP", "£"],
    ["BRL", "R$"],
    ["CHF", "CHF"],
    ["DKK", "kr"],
    ["NOK", "kr"],
    ["SEK", "kr"],
    ["HUF", "Ft"],
    ["ILS", "₪"],
    ["INR", "₹"],
    ["JPY", "¥"],
    ["MYR", "RM"],
    ["PHP", "₱"],
    ["PLN", "zł"],
    ["UAH", "₴"],
    ["RUB", "₽"],
    ["TWD", "NT$"],
    ["THB", "฿"],
    ["TRY", "₺"]
]);

exports.processDonationEvent = (eventData) => {
    EventManager.triggerEvent(EVENT_SOURCE_ID, EventId.DONATION, {
        donationAmount: eventData.amount,
        formattedDonationAmount: currencies.get(eventData.currency) + eventData.amount,
        donationMessage: eventData.message,
        from: eventData.username
    });
};

exports.processFollowEvent = (eventData) => {
    EventManager.triggerEvent(EVENT_SOURCE_ID, EventId.FOLLOW, {
        username: eventData.displayName
    });
};
