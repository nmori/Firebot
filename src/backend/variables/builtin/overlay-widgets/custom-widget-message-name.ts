import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "customWidgetMessageName",
    description: "カスタムウィジェットメッセージの名前",
    events: ["firebot:custom-widget-message-received"],
    type: "text",
    eventMetaKey: "customWidgetMessageName"
});