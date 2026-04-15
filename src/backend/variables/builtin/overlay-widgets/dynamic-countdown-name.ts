import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "dynamicCountdownName",
    description: "ダイナミックカウントダウンウィジェットの名前",
    events: ["firebot:dynamic-countdown-finished"],
    type: "text",
    eventMetaKey: "dynamicCountdownWidgetName"
});