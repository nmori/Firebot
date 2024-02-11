import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "currencyName",
    description: "通貨名",
    events: ["firebot:currency-update"],
    type: "text",
    eventMetaKey: "currencyName"
});