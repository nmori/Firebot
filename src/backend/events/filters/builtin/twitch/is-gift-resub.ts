import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "twitch:is-gift-resub",
    name: "ギフトによる再サブ",
    description: "再サブがギフトによるものかどうかでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "sub" }
    ],
    eventMetaKey: "isGiftResub",
    presetValues: () => [
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