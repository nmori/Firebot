import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:raid-viewer-count",
    name: "レイド視聴者数",
    description: "レイドで連れてきた、または送信した視聴者数でフィルタ",
    eventMetaKey: "viewerCount",
    events: [
        { eventSourceId: "twitch", eventId: "raid" },
        { eventSourceId: "twitch", eventId: "raid-sent-off" }
    ]
});

export default filter;