import { createTextOrNumberFilter } from "../../filter-factory";

const filter = createTextOrNumberFilter({
    id: "firebot:metadata-value",
    name: "メタデータ値",
    description: "メタデータ値に基づいてイベントをフィルタリングします。テキストまたは数値の値タイプでのみ機能します。",
    eventMetaKey: "metadataValue",
    events: [
        { eventSourceId: "firebot", eventId: "viewer-metadata-updated" }
    ]
});

export default filter;
