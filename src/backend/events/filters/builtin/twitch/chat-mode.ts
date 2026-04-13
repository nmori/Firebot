import { EventFilter, PresetValue } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";

const filter: EventFilter = {
    id: "firebot:chatmode",
    name: "チャットモード",
    description: "チャットモードでフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: async () => {
        return [
            {
                value: "emoteonly",
                display: "エモートのみ"
            },
            {
                value: "followers",
                display: "フォロワーのみ"
            },
            {
                value: "subscribers",
                display: "サブスクライバーのみ"
            },
            {
                value: "slow",
                display: "スローモード"
            },
            {
                value: "uniquechat",
                display: "ユニークチャット"
            }
        ];
    },
    getSelectedValueDisplay: async (filterSettings, presetValues: PresetValue[]) => {
        return presetValues
            .find(pv => pv.value === filterSettings.value || (filterSettings.value === "r9kbeta" && pv.value === "uniquechat"))?.display ?? "[未設定]";
    },
    predicate: async (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;
        // Unique chat previously used 'r9kbeta' on PubSub; became 'uniquechat' on EventSub.
        const ucValue = value === "r9kbeta" ? "uniquechat" : value;

        const chatModes = eventMeta.chatMode as string;

        switch (comparisonType) {
            case ComparisonType.IS:
                return chatModes.includes(ucValue);
            case ComparisonType.IS_NOT:
                return !chatModes.includes(ucValue);
            default:
                return false;
        }
    }
};

export default filter;