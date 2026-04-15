import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "customWidgetName",
    description: "カスタムウィジェットの名前",
    events: ["firebot:custom-widget-message-received"],
    type: "text",
    eventMetaKey: "customWidgetName"
});