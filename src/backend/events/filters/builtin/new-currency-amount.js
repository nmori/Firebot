"use strict";

const { createNumberFilter } = require("../filter-factory");

module.exports = createNumberFilter({
    id: "firebot:new-currency-amount",
    name: "新しい通貨の金額",
    description: "新しい通貨の金額でフィルタします",
    events: [
        { eventSourceId: "firebot", eventId: "currency-update" }
    ],
    eventMetaKey: "newCurrencyAmount"
});