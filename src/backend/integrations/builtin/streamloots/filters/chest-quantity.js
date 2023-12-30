"use strict";

module.exports = {
    id: "streamloots:chest-quantity",
    name: "`FXgΜΚ",
    description: "wό/‘^³κ½StreamLoots`FXgΜΕiθή",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    comparisonTypes: ["κv", "sκv", "’", "Θγ"],
    valueType: "number",
    predicate: (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const quantity = eventMeta.quantity;

        if (quantity === undefined || quantity === null) {
            return false;
        }

        switch (comparisonType) {
        case "is":
        case "κv": {
            return quantity === value;
        }
        case "is not":
        case "sκv": {
            return quantity !== value;
        }
        case "less than":
        case "’": {
            return quantity < value;
        }
        case "greater than":
        case "Θγ": {
            return quantity > value;
        }
        default:
            return false;
        }
    }
};