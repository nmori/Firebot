import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:previous-currency-amount",
    name: "前回通貨量",
    description: "視聴者の前回通貨量でフィルタ",
    eventMetaKey: "previousCurrencyAmount",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ]
});

export default filter;