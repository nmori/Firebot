import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:sub-type",
    name: "サブスクティア",
    description: "サブスクのティア（Prime、Tier 1、2、3など）でフィルタリングします",
    events: [
        { eventSourceId: "twitch", eventId: "sub" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" },
        { eventSourceId: "twitch", eventId: "prime-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "gift-sub-upgraded" }
    ],
    eventMetaKey: "subPlan",
    allowIsNot: true,
    presetValues: () => [
        {
            value: "Prime",
            display: "Prime"
        },
        {
            value: "1000",
            display: "Tier 1"
        },
        {
            value: "2000",
            display: "Tier 2"
        },
        {
            value: "3000",
            display: "Tier 3"
        }
    ]
});

export default filter;