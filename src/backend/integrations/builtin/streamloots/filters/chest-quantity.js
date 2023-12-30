"use strict";

module.exports = {
    id: "streamloots:chest-quantity",
    name: "ƒ`ƒFƒXƒg‚Ì”—Ê",
    description: "w“ü/‘¡—^‚³‚ê‚½StreamLootsƒ`ƒFƒXƒg‚Ì”‚Åi‚èž‚Þ",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    comparisonTypes: ["ˆê’v", "•sˆê’v", "–¢–ž", "ˆÈã"],
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
        case "ˆê’v": {
            return quantity === value;
        }
        case "is not":
        case "•sˆê’v": {
            return quantity !== value;
        }
        case "less than":
        case "–¢–ž": {
            return quantity < value;
        }
        case "greater than":
        case "ˆÈã": {
            return quantity > value;
        }
        default:
            return false;
        }
    }
};