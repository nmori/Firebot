import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "customWidgetId",
    description: "カスタムウィジェットの ID",
    events: ["firebot:custom-widget-message-received"],
    type: "text",
    eventMetaKey: "customWidgetId"
});