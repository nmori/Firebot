import { EventFilter, PresetValue } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";
import { mapLegacyComparisonType } from "../../../../../shared/filter-helpers";

const { ComparisonType } = require("../../../../shared/filter-constants");

module.exports = {
    id: "firebot:chatmode",
    name: "繝√Ε繝・ヨ繝｢繝ｼ繝・,
    description: "繝√Ε繝・ヨ繝｢繝ｼ繝峨↓繝輔ぅ繝ｫ繧ｿ繝ｼ繧偵°縺代ｋ",
    events: [
        { eventSourceId: "twitch", eventId: "chat-mode-changed" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: () => {
        return [
            {
                value: "emoteonly",
                display: "繧ｨ繝｢繝ｼ繝医・縺ｿ"
            },
            {
                value: "followers",
                display: "繝輔か繝ｭ繝ｯ繝ｼ縺ｮ縺ｿ"
            },
            {
                value: "subscribers",
                display: "繧ｵ繝悶せ繧ｯ繝ｩ繧､繝舌・縺ｮ縺ｿ"
            },
            {
                value: "slow",
                display: "繧ｹ繝ｭ繝ｼ繝｢繝ｼ繝・
            },
            {
                value: "uniquechat",
                display: "繝ｦ繝九・繧ｯ繝√Ε繝・ヨ"
            }
        ];
    },
    getSelectedValueDisplay: async (filterSettings, presetValues: PresetValue[]) => {
        return presetValues
            .find(pv => pv.value === filterSettings.value || (filterSettings.value === "r9kbeta" && pv.value === "uniquechat"))?.display ?? "[Not Set]";
    },
    predicate: async (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        // 譌ｧ蠑上・ComparisonType繧呈ｨ呎ｺ門喧
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
