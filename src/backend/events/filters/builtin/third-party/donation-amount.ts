import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:donation-amount",
    name: "寄付金額",
    description: "寄付金額で絞り込みます",
    eventMetaKey: "donationAmount",
    events: [
        { eventSourceId: "streamlabs", eventId: "donation" },
        { eventSourceId: "streamlabs", eventId: "eldonation" },
        { eventSourceId: "extralife", eventId: "donation" },
        { eventSourceId: "tipeeestream", eventId: "donation" },
        { eventSourceId: "streamelements", eventId: "donation" }
    ]
});

export default filter;