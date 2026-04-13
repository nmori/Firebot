import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:custom-widget",
    name: "カスタムウィジェット",
    description: "カスタムオーバーレイウィジェット（Basic と Advanced の両方）でフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "custom-widget-message-received" }
    ],
    eventMetaKey: "customWidgetId",
    allowIsNot: true,
    presetValues: (overlayWidgetsService: any) => {
        return overlayWidgetsService.getOverlayWidgetConfigsByTypes(["firebot:custom", "firebot:custom-advanced"])
            .map(c => ({ value: c.id, display: c.name }));
    },
    valueIsStillValid: (filterSettings, overlayWidgetsService: any) => {
        return overlayWidgetsService.getOverlayWidgetConfigsByTypes(["firebot:custom", "firebot:custom-advanced"])
            .some(c => c.id === filterSettings.value);
    }
});

export default filter;