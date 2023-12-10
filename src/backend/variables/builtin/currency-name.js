"use strict";

const { createEventDataVariable } = require("../variable-factory");

module.exports = createEventDataVariable({
    handle: "currencyName",
    description: "通貨名を取得します",
    events: ["firebot:currency-update"],
    type: "text",
    eventMetaKey: "currencyName"
});