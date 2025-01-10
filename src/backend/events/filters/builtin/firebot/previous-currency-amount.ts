import { createNumberFilter } from "../../filter-factory";

const filter = createNumberFilter({
    id: "firebot:previous-currency-amount",
    name: "前の通貨金額",
    description: "視聴者の前の通貨金額で絞り込む",
    eventMetaKey: "previousCurrencyAmount",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ]
});

export default filter;