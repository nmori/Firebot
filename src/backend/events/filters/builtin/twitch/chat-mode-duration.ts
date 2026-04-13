import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:chatmodeduration",
    name: "継続時間",
    description: "チャットモードの継続時間でフィルタ（スローは秒、フォロワーは分のみ）",
    eventMetaKey: "duration",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ]
});

export default filter;