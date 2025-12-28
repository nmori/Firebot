import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:new-view-time",
    name: "新規視聴時間",
    description: "視聴者の新規視聴時間（時間）でフィルタリングします",
    eventMetaKey: "newViewTime",
    events: [
        { eventSourceId: "firebot", eventId: "view-time-update" }
    ]
});

export default filter;