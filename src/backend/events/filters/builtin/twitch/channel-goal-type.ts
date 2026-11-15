import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:channel-goal-type",
    name: "チャンネル目標の種類",
    description: "チャンネル目標の種類でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "channel-goal-begin" },
        { eventSourceId: "twitch", eventId: "channel-goal-progress" },
        { eventSourceId: "twitch", eventId: "channel-goal-end" }
    ],
    eventMetaKey: "type",
    presetValues: () => [
        { value: "follow", display: "フォロワー" },
        { value: "new_subscription_count", display: "新規サブ数" },
        { value: "subscription_count", display: "合計サブ数" },
        { value: "new_subscription", display: "新規サブポイント" },
        { value: "subscription", display: "合計サブポイント" }
    ]
});

export default filter;