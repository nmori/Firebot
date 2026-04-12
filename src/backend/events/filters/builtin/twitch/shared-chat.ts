import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:is-shared-chat-message",
    name: "Shared Chat",
    description: "イベントが共有チャットメッセージによってトリガーされたかどうかでフィルタリングする。",
    events: [
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "announcement" },
        { eventSourceId: "twitch", eventId: "first-time-chat" },
        { eventSourceId: "twitch", eventId: "viewer-arrived" }
    ],
    eventMetaKey: "chatMessage.isSharedChatMessage",
    presetValues: async () => [
        {
            value: "true",
            display: "True"
        },
        {
            value: "false",
            display: "False"
        }
    ]
});

export default filter;