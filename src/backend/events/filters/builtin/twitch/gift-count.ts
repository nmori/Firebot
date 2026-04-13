import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:gift-count",
    name: "ギフト数",
    description: "ギフトされたサブ数でフィルタ",
    eventMetaKey: "subCount",
    events: [
        { eventSourceId: "twitch", eventId: "community-subs-gifted" }
    ]
});

export default filter;