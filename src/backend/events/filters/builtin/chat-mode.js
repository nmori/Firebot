<<<<<<< HEAD:src/backend/events/filters/builtin/chat-mode.js
"use strict";
=======
import { EventFilter, PresetValue } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";
import { mapLegacyComparisonType } from "../../../../../shared/filter-helpers";
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/events/filters/builtin/twitch/chat-mode.ts

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmode",
    name: "チャットモード",
    description: "チャットモードにフィルターをかける",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: () => {
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
<<<<<<< HEAD:src/backend/events/filters/builtin/chat-mode.js
                value: "r9kbeta",
=======
                value: "uniquechat",
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/events/filters/builtin/twitch/chat-mode.ts
                display: "ユニークチャット"
            }
        ];
    },
<<<<<<< HEAD:src/backend/events/filters/builtin/chat-mode.js
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
        case "emoteonly":
            return "エモートのみ";
        case "followers":
            return "フォロワーのみ";
        case "subscribers":
            return "サブスクライバーのみ";
        case "slow":
            return "スローモード";
        case "r9kbeta":
            return "ユニークチャット";
        default:
            return "[未設定]";
        }
=======
    getSelectedValueDisplay: async (filterSettings, presetValues: PresetValue[]) => {
        return presetValues
            .find(pv => pv.value === filterSettings.value || (filterSettings.value === "r9kbeta" && pv.value === "uniquechat"))?.display ?? "[Not Set]";
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/events/filters/builtin/twitch/chat-mode.ts
    },
    predicate: async (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

<<<<<<< HEAD:src/backend/events/filters/builtin/chat-mode.js
        switch (comparisonType) {
        case "is":
        case "一致":
            return eventMeta.chatMode.includes(value);
        case "is not":
        case "不一致":
            return !eventMeta.chatMode.includes(value);
        default:
            return false;
        }
    }
};
=======
        // 旧式のComparisonTypeを標準化
        const standardComparisonType = mapLegacyComparisonType(comparisonType);

        switch (standardComparisonType) {
            case ComparisonType.IS:
                return chatModes.includes(value);
            case ComparisonType.IS_NOT:
                return !chatModes.includes(value);
            default:
                return false;
        }
    }
};

export default filter;
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20:src/backend/events/filters/builtin/twitch/chat-mode.ts
