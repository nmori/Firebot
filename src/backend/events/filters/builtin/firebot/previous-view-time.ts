import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:previous-view-time",
    name: "前回視聴時間",
    description: "視聴者の前回視聴時間（時間）でフィルタ",
    eventMetaKey: "previousViewTime",
    events: [
        { eventSourceId: "firebot", eventId: "view-time-update" }
    ]
});

export default filter;