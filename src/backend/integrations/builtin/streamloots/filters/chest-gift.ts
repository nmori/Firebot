import { EventFilter } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";

const filter: EventFilter = {
    id: "streamloots:gift-purchase",
    name: "チェスト購入",
    description: "StreamLoots チェスト購入がギフトかどうかでフィルターします",
    events: [
        { eventSourceId: "streamloots", eventId: "purchase" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: async () => {
        return [
            {
                value: "true",
                display: "ギフト"
            },
            {
                value: "false",
                display: "ギフトではない"
            }
        ];
    },
    getSelectedValueDisplay: (filterSettings) => {

        if (filterSettings.value == null) {
            return "[未設定]";
        }

        return filterSettings.value === "true" ? "ギフト" : "ギフトではない";
    },
    predicate: (filterSettings, eventData) => {

        const { value } = filterSettings;
        const { eventMeta } = eventData;

        const filterGiftValue = value === "true";

        const isGift = eventMeta.giftee != null;

        return filterGiftValue === isGift;
    }
};

export = filter;