"use strict";

module.exports = {
    id: "streamloots:chest-quantity",
    name: "チェストの数量",
    description: "購入/贈与されたStreamLootsチェストの数で絞り込む",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    comparisonTypes: ["一致", "不一致", "未満", "以上"],
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
        case "一致": {
            return quantity === value;
        }
        case "is not":
        case "不一致": {
            return quantity !== value;
        }
        case "less than":
        case "未満": {
            return quantity < value;
        }
        case "greater than":
        case "以上": {
            return quantity > value;
        }
        default:
            return false;
        }
    }
};