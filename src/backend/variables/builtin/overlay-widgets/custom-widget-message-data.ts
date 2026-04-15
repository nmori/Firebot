import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "customWidgetMessageData",
    description: "カスタムウィジェットメッセージのデータ",
    events: ["firebot:custom-widget-message-received"],
    type: "ALL",
    eventMetaKey: "customWidgetMessageData"
});