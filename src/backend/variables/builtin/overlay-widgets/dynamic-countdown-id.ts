import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "dynamicCountdownId",
    description: "ダイナミックカウントダウンウィジェットの ID",
    events: ["firebot:dynamic-countdown-finished"],
    type: "text",
    eventMetaKey: "dynamicCountdownWidgetId"
});