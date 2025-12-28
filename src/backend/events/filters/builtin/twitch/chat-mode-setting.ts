import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:chatmodesetting",
    name: "設定",
    description: "チャットモードの設定でフィルタリングします",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    eventMetaKey: "chatModeState",
    presetValues: async () => [
        {
            value: "enabled",
            display: "Enabled"
        },
        {
            value: "disabled",
            display: "Disabled"
        }
    ]
});

export default filter;