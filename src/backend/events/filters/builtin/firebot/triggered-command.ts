import { ComparisonType } from "../../../../../shared/filter-constants";
import { EventFilter } from "../../../../../types/events";

const filter: EventFilter = {
    id: "firebot:triggered-command",
    name: "コマンド発火",
    description: "チャットメッセージがコマンドを発火したかどうかでフィルタ",
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
                display: "はい"
            },
            {
                value: "false",
                display: "いいえ"
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