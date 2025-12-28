import { ComparisonType } from "../../../../../shared/filter-constants";
import { EventFilter } from "../../../../../types/events";

const filter: EventFilter = {
    id: "firebot:triggered-command",
    name: "トリガーされたコマンド",
    description: "チャットメッセージがコマンドをトリガーしたかどうかでフィルタリングします",
    events: [
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "action" }
    ],
    comparisonTypes: [ComparisonType.IS],
    valueType: "preset",
    presetValues: async () => {
        return [
            {
                value: "true",
                display: "True"
            },
            {
                value: "false",
                display: "False"
            }
        ];
    },
    valueIsStillValid: filterSettings => filterSettings.value != null,
    predicate: async (filterSettings, eventData) => {
        const { value } = filterSettings;
        return eventData.eventMeta?.triggeredCommand?.toString() === value;
    }
};

export default filter;