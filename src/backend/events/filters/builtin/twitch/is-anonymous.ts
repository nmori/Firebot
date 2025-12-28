import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:is-anonymous",
    name: "匿名",
    description: "イベントが匿名ユーザーによってトリガーされたかどうかでフィルタリングします",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" }
    ],
    eventMetaKey: "isAnonymous",
    presetValues: async () => [
        {
            value: "true",
            display: "True"
        },
        {
            value: "false",
            display: "False"
        }
    ]
});

export default filter;