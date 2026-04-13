import { createPresetFilter } from "../../filter-factory";

const filter = createPresetFilter({
    id: "firebot:webhook",
    name: "ウェブフック",
    description: "指定したウェブフックでフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "webhook-received" }
    ],
    eventMetaKey: "webhookId",
    allowIsNot: true,
    presetValues: async (webhooksService: any) => {
        return webhooksService.webhookConfigs.map(w => ({value: w.id, display: w.name}));
    },
    valueIsStillValid: async (filterSettings, webhooksService: any) => {
        return webhooksService.webhookConfigs.some(w => w.id === filterSettings.value);
    }
});

export default filter;