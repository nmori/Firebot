import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:new-currency-amount",
    name: "新しい通貨量",
    description: "視聴者の新しい通貨量でフィルタ",
    eventMetaKey: "newCurrencyAmount",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ]
});

export default filter;