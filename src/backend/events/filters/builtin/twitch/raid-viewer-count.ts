import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:raid-viewer-count",
    name: "レイド視聴者数",
    description: "レイドによって連れてこられた、または送られている視聴者の数でフィルタリングします",
    eventMetaKey: "viewerCount",
    events: [
        { eventSourceId: "twitch", eventId: "raid" },
        { eventSourceId: "twitch", eventId: "raid-sent-off" }
    ]
});

export default filter;