import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:is-anonymous",
    name: "匿名",
    description: "イベントが匿名ユーザーによるものかどうかでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "community-subs-gifted" }
    ],
    eventMetaKey: "isAnonymous",
    presetValues: async () => [
        {
            value: "true",
            display: "はい"
        },
        {
            value: "false",
            display: "いいえ"
        }
    ]
});

export default filter;