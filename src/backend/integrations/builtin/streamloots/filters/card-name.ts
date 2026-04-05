import { createTextFilter } from "../../../../events/filters/filter-factory";

const filter = createTextFilter({
    id: "streamloots:card-name",
    name: "カード名",
    description: "StreamLoots カード名でフィルターします",
    events: [
        { eventSourceId: "streamloots", eventId: "redemption" }
    ],
    eventMetaKey: "cardName",
    caseInsensitive: true
});

export = filter;