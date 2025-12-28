import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:rank-transition-type",
    name: "ランク移行タイプ",
    description: "特定のランク移行タイプ（昇格または降格）でフィルタリングします",
    events: [
        { eventSourceId: "firebot", eventId: "viewer-rank-updated" }
    ],
    eventMetaKey: (eventData, filterSettings) => {
        if (filterSettings.value === "Promotion") {
            return "isPromotion";
        }
        if (filterSettings.value === "Demotion") {
            return "isDemotion";
        }
        return "";
    },
    presetValues: () => [
        { value: "Promotion", display: "Promotion" },
        { value: "Demotion", display: "Demotion" }
    ]
});

export default filter;