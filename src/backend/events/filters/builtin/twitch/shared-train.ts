import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:shared-train",
    name: "共有トレイン",
    description: "ハイプトレインが他の配信者と共有されているかどうかでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "hype-train-end" },
        { eventSourceId: "twitch", eventId: "hype-train-progress" },
        { eventSourceId: "twitch", eventId: "hype-train-start" }
    ],
    eventMetaKey: "isSharedTrain",
    presetValues: async () => [
        { value: "true", display: "はい" },
        { value: "false", display: "いいえ" }
    ]
});

export default filter;
