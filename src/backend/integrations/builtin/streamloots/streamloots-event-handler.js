"use strict";

const logger = require("../../../logwrapper");

const { EventManager } = require("../../../events/event-manager");

const EVENT_SOURCE_ID = "streamloots";
const EventId = {
    PURCHASE: "purchase",
    REDEMPTION: "redemption"
};

const eventSourceDefinition = {
    id: EVENT_SOURCE_ID,
    name: "StreamLoots",
    description: "StreamLoots 由来の購入／引き換えイベント",
    events: [
        {
            id: EventId.PURCHASE,
            name: "チェスト購入",
            description: "誰かがチェストを購入またはギフトしたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                message: "テストメッセージ",
                quantity: 5,
                giftee: "ebiggz"
            },
            isIntegration: true
        },
        {
            id: EventId.REDEMPTION,
            name: "カード引き換え",
            description: "誰かがカードを引き換えたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                message: "テストメッセージ",
                alertMessage: "アラートメッセージ",
                cardRarity: {
                    type: "enum",
                    options: {
                        "common": "コモン",
                        "rare": "レア",
                        "epic": "エピック",
                        "legendary": "レジェンダリー"
                    },
                    value: "common"
                },
                cardName: "Hidden GIF"
            },
            isIntegration: true
        }
    ]
};

exports.registerEvents = () => {
    EventManager.registerEventSource(eventSourceDefinition);
};

function getFieldValue(fieldName, fields) {
    if (fields == null) {
        return null;
    }
    const field = fields.find(f => f.name === fieldName);
    return field ? field.value : null;
}

exports.processStreamLootsEvent = (eventData) => {

    logger.debug("Received StreamLoots event:", eventData);

    const metadata = {
        imageUrl: eventData.imageUrl,
        soundUrl: eventData.soundUrl,
        message: getFieldValue("message", eventData.data.fields),
        alertMessage: eventData.message
    };

    if (metadata.message == null) {
        metadata.message = eventData.message;
    }

    metadata.username = getFieldValue("username", eventData.data.fields);

    const streamlootsEventType = eventData.data.type;

    let eventId;
    if (streamlootsEventType === "purchase") {
        eventId = EventId.PURCHASE;

        const quantity = getFieldValue("quantity", eventData.data.fields);
        const giftee = getFieldValue("giftee", eventData.data.fields);

        metadata.quantity = quantity;
        metadata.giftee = giftee;

    } else if (streamlootsEventType === "redemption") {
        eventId = EventId.REDEMPTION;

        const cardRarity = getFieldValue("rarity", eventData.data.fields);
        metadata.cardRarity = cardRarity;
        metadata.cardName = eventData.data.cardName;
    }

    EventManager.triggerEvent(EVENT_SOURCE_ID, eventId, metadata);
};