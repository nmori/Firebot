import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:chatmodesetting",
    name: "設定",
    description: "チャットモードの設定でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    eventMetaKey: "chatModeState",
    presetValues: async () => [
        {
            value: "enabled",
            display: "有効"
        },
        {
            value: "disabled",
            display: "無効"
        }
    ]
});

export default filter;