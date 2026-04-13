import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:lifetime-gift-count",
    name: "累計ギフト数",
    description: "このユーザーがチャンネル累計でギフトしたサブ数でフィルタ",
    eventMetaKey: "lifetimeGiftCount",
    events: [
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" }
    ]
});

export default filter;