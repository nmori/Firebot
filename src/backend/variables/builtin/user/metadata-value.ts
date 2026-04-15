import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "metadataValue",
    description: "このイベントに関連するメタデータ値を返します。",
    events: ["firebot:viewer-metadata-updated"],
    type: "ALL",
    eventMetaKey: "metadataValue"
});