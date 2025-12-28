import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:gift-duration",
    name: "ギフト期間",
    description: "ギフトサブスクの期間（月単位）でフィルタリングします",
    eventMetaKey: "giftDuration",
    events: [
        { eventSourceId: "twitch", eventId: "subs-gifted" }
    ]
});

export default filter;