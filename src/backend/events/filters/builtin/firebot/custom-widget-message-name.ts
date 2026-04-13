import { createTextFilter } from "../../filter-factory";

const filter = createTextFilter({
    id: "firebot:custom-widget-message-name",
    name: "メッセージ名",
    description: "指定したメッセージ名でフィルタ",
    events: [
        { eventSourceId: "firebot", eventId: "custom-widget-message-received" }
    ],
    eventMetaKey: "customWidgetMessageName"
});

export default filter;