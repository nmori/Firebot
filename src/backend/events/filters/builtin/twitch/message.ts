import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:message-text",
    name: "チャットメッセージ",
    description: "チャットメッセージテキストに基づくフィルタリング",
    eventMetaKey: "messageText",
    events: [
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "announcement" }
    ]
});

export default filter;
