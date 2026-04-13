import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:gift-duration",
    name: "ギフト期間",
    description: "ギフトサブの期間（月）でフィルタ",
    eventMetaKey: "giftDuration",
    events: [
        { eventSourceId: "twitch", eventId: "subs-gifted" }
    ]
});

export default filter;