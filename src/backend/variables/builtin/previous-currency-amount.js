"use strict";

const { createEventDataVariable } = require("../variable-factory");

module.exports = createEventDataVariable({
    handle: "previousCurrencyAmount",
    description: "視聴者が持っていた以前の通貨量",
    events: ["firebot:currency-update"],
    type: "number",
    eventMetaKey: "previousCurrencyAmount"
});