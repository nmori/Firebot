import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:previous-view-time",
    name: "以前の視聴時間",
    description: "視聴者の以前の視聴時間（時間）でフィルタリングします",
    eventMetaKey: "previousViewTime",
    events: [
        { eventSourceId: "firebot", eventId: "view-time-update" }
    ]
});

export default filter;