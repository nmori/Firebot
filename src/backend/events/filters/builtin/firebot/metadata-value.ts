import { createTextOrNumberFilter } from "../../filter-factory";

const filter = createTextOrNumberFilter({
    id: "firebot:metadata-value",
    name: "メタデータ値",
    description: "メタデータ値に基づいてイベントをフィルタ。テキストまたは数値型の値でのみ動作します。",
    eventMetaKey: "metadataValue",
    events: [
        { eventSourceId: "firebot", eventId: "viewer-metadata-updated" }
    ]
});

export default filter;
