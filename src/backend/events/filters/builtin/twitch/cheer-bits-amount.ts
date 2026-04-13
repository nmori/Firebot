import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:cheerbitsamount",
    name: "チアーのビット数",
    description: "チアーに含まれるビット数でフィルタ",
    eventMetaKey: "bits",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" }
    ]
});

export default filter;