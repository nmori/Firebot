import { EventFilter, PresetValue } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";

const filter: EventFilter = {
    id: "firebot:sub-kind",
    name: "サブスク状態",
    description: "サブスクの種類で絞り込む（再サブスクか初サブスクか）",
    events: [
        { eventSourceId: "twitch", eventId: "sub" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: () => [
            {
                value: "first",
                display: "初回"
            },
            {
                value: "resub",
                display: "再び"
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