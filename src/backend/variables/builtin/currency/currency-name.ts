import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "currencyName",
    description: "通貨の名前を返します。",
    events: ["firebot:currency-update"],
    type: "text",
    eventMetaKey: "currencyName"
});