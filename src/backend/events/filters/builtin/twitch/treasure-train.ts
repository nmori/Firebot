import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:treasure-train",
    name: "トレジャートレイン",
    description: "ハイプトレインがトレジャートレインかどうかでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "hype-train-end" },
        { eventSourceId: "twitch", eventId: "hype-train-progress" },
        { eventSourceId: "twitch", eventId: "hype-train-start" }
    ],
    eventMetaKey: "isTreasureTrain",
    presetValues: async () => [
        { value: "true", display: "はい" },
        { value: "false", display: "いいえ" }
    ]
});

export default filter;
