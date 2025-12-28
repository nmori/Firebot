import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:cheerbitsamount",
    name: "チアーBits量",
    description: "チアーのBits量でフィルタリングします",
    eventMetaKey: "bits",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" }
    ]
});

export default filter;