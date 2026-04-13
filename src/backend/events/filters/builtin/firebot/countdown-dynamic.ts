import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:countdown-dynamic",
    name: "カウントダウンタイマー（動的）",
    description: "カウントダウンタイマー（動的）オーバーレイウィジェットでフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "dynamic-countdown-finished" }
    ],
    eventMetaKey: "dynamicCountdownWidgetId",
    allowIsNot: true,
    presetValues: (overlayWidgetsService: any) => {
        return overlayWidgetsService.getOverlayWidgetConfigsByType("firebot:countdown-dynamic")
            .map(c => ({ value: c.id, display: c.name }));
    },
    valueIsStillValid: (filterSettings, overlayWidgetsService: any) => {
        return overlayWidgetsService.getOverlayWidgetConfigsByType("firebot:countdown-dynamic")
            .some(c => c.id === filterSettings.value);
    }
});

export default filter;