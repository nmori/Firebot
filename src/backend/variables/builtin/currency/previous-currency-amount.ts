import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "previousCurrencyAmount",
    description: "視聴者が以前持っていた通貨の残高を返します。",
    events: ["firebot:currency-update"],
    type: "number",
    eventMetaKey: "previousCurrencyAmount"
});