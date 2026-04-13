import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:rank-transition-type",
    name: "ランク変動種別",
    description: "指定したランク変動種別（昇格または降格）でフィルタ",
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
        { value: "Promotion", display: "昇格" },
        { value: "Demotion", display: "降格" }
    ]
});

export default filter;