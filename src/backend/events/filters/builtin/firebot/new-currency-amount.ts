import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:new-currency-amount",
    name: "新しい通貨の金額",
    description: "新しい通貨の金額でフィルタします",
    eventMetaKey: "newCurrencyAmount",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ]
});

export default filter;