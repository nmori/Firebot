import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:metadata-key",
    name: "メタデータキー",
    description: "メタデータキーに基づいてイベントをフィルタリングします。",
    eventMetaKey: "metadataKey",
    events: [
        { eventSourceId: "firebot", eventId: "viewer-metadata-updated" }
    ]
});

export default filter;
