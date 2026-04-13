import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:message-text",
    name: "メッセージ本文",
    description: "チャットメッセージ本文でフィルタ",
    eventMetaKey: "messageText",
    events: [
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "announcement" }
    ]
});

export default filter;
