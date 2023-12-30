"use strict";

const { createEventDataVariable } = require("../variable-factory");

module.exports = createEventDataVariable({
    handle: "currencyName",
    description: "通貨名",
    events: ["firebot:currency-update"],
    type: "text",
    eventMetaKey: "currencyName"
});