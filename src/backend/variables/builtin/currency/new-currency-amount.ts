import { createEventDataVariable } from "../../variable-factory";

export default createEventDataVariable({
    handle: "newCurrencyAmount",
    description: "視聴者が持っている新しい通貨量",
    events: ["firebot:currency-update"],
    type: "number",
    eventMetaKey: "newCurrencyAmount"
});