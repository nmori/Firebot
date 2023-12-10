"use strict";

const { createNumberFilter } = require("../filter-factory");

module.exports = createNumberFilter({
    id: "firebot:previous-currency-amount",
    name: "前の通貨金額",
    description: "視聴者の前の通貨金額で絞り込む",
    eventMetaKey: "previousCurrencyAmount",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ]
});