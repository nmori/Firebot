import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:chatmodeduration",
    name: "期間",
    description: "チャットモードの期間でフィルタリングします（スローモード（秒）とフォロワーモード（分）のみ）",
    eventMetaKey: "duration",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ]
});

export default filter;