import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:donationfrom",
    name: "寄付者",
    caseInsensitive: true,
    description: "特定の寄付送信者で絞り込みます",
    eventMetaKey: "from",
    events: [
        { eventSourceId: "streamlabs", eventId: "donation" },
        { eventSourceId: "streamlabs", eventId: "eldonation" },
        { eventSourceId: "extralife", eventId: "donation" },
        { eventSourceId: "tipeeestream", eventId: "donation" },
        { eventSourceId: "streamelements", eventId: "donation" }
    ]
});

export default filter;