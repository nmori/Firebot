"use strict";

const eventManager = require("../../../events/EventManager");

const EVENT_SOURCE_ID = "streamelements";
const EventId = {
    DONATION: "donation",
    FOLLOW: "follow"
};

const eventSourceDefinition = {
    id: EVENT_SOURCE_ID,
    name: "StreamElements",
    description: "StreamElementsからの寄付イベント",
    events: [
        {
            id: EventId.DONATION,
            name: "ドネーション",
            description: "誰かが寄付をしたとき.",
            cached: false,
            manualMetadata: {
                from: "StreamElements",
                donationAmount: 5,
                donationMessage: "テストメッセージ"
            },
            isIntegration: true,
            activityFeed: {
                icon: "fad fa-money-bill",
                getMessage: (eventData) => {
                    return `**${eventData.from}** からドネートがありました **$${eventData.donationAmount}**${eventData.donationMessage && !!eventData.donationMessage.length ? `: *${eventData.donationMessage}*` : ''}`;
                }
            }
        },
        {
            id: EventId.FOLLOW,
            name: "フォロー",
            description: "誰かがあなたのTwitchチャンネルをフォローした場合（StreamElementsより）",
            cacheMetaKey: "username",
            cached: true,
            manualMetadata: {
                username: "StreamElements"
            },
            isIntegration: true,
            activityFeed: {
                icon: "fas fa-heart",
                getMessage: (eventData) => {
                    return `**${eventData.username}** followed`;
                }
            }
        }
    ]
};

exports.registerEvents = () => {
    eventManager.registerEventSource(eventSourceDefinition);
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
    eventManager.triggerEvent(EVENT_SOURCE_ID, EventId.DONATION, {
        donationAmount: eventData.amount,
        formattedDonationAmount: currencies.get(eventData.currency) + eventData.amount,
        donationMessage: eventData.message,
        from: eventData.username
    });
};

exports.processFollowEvent = (eventData) => {
    eventManager.triggerEvent(EVENT_SOURCE_ID, EventId.FOLLOW, {
        username: eventData.displayName
    });
};
