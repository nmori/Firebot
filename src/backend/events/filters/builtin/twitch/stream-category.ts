import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:category-changed",
    name: "カテゴリ",
    caseInsensitive: true,
    description: "現在配信に設定されているカテゴリでフィルタ",
    eventMetaKey: "category",
    events: [
        { eventSourceId: "firebot", eventId: "category-changed" },
        { eventSourceId: "twitch", eventId: "category-changed" }
    ]
});

export default filter;