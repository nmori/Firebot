import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:golden-kappa-train",
    name: "ゴールデンカッパトレイン",
    description: "ハイプトレインがゴールデンカッパトレインかどうかでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "hype-train-end" },
        { eventSourceId: "twitch", eventId: "hype-train-progress" },
        { eventSourceId: "twitch", eventId: "hype-train-start" }
    ],
    eventMetaKey: "isGoldenKappaTrain",
    presetValues: async () => [
        { value: "true", display: "はい" },
        { value: "false", display: "いいえ" }
    ]
});

export default filter;
