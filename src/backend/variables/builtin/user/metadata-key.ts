import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "metadataKey",
    description: "このイベントに関連するメタデータキーを返します。",
    events: ["firebot:viewer-metadata-updated"],
    type: "text",
    eventMetaKey: "metadataKey"
});