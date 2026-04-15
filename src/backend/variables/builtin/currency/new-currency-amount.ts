import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "newCurrencyAmount",
    description: "視聴者が持つ通貨の新しい残高を返します。",
    events: ["firebot:currency-update"],
    type: "number",
    eventMetaKey: "newCurrencyAmount"
});