import { createNumberFilter } from "../../../../events/filters/filter-factory";

const filter = createNumberFilter({
    id: "streamloots:chest-quantity",
    name: "チェスト数",
    description: "購入/ギフトされた StreamLoots チェスト数でフィルターします",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    eventMetaKey: "quantity"
});

export = filter;