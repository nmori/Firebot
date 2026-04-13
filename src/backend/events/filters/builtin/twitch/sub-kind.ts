import { EventFilter, PresetValue } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";

const filter: EventFilter = {
    id: "firebot:sub-kind",
    name: "サブ種別",
    description: "サブの種類（初回サブか再サブか）でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "sub" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => [
        {
            value: "first",
            display: "初回サブ"
        },
        {
            value: "resub",
            display: "再サブ"
        }
    ],
    getSelectedValueDisplay: (filterSettings, presetValues: PresetValue[]) => {
        return presetValues
            .find(pv => pv.value === filterSettings.value)?.display ?? "[未設定]";
    },
    predicate: (filterSettings, eventData) => {
        const { value } = filterSettings;
        const { eventMeta } = eventData;

        if (value == null) {
            return true;
        }

        const isResub = eventMeta.isResub;
        const expectingResub = value === "resub";

        return isResub === expectingResub;
    }
};

export default filter;