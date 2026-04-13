import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:sub-type",
    name: "サブティア",
    description: "サブのティア（プライム、ティア1、2、3 など）でフィルタ",
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
            display: "プライム"
        },
        {
            value: "1000",
            display: "ティア1"
        },
        {
            value: "2000",
            display: "ティア2"
        },
        {
            value: "3000",
            display: "ティア3"
        }
    ]
});

export default filter;