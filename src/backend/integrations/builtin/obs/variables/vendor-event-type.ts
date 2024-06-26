import { TriggerType } from "../../../../common/EffectType";
import { ReplaceVariable } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_VENDOR_EVENT_EVENT_ID
} from "../constants";

const triggers = {};
triggers[TriggerType.EVENT] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_VENDOR_EVENT_EVENT_ID}`
];

export const VendorEventTypeVariable: ReplaceVariable = {
    definition: {
        handle: "obsVendorEventType",
        description:
      "OBS ベンダーイベントのトリガーとなったベンダー指定のイベントタイプ。",
        possibleDataOutput: ["text"],
        triggers: triggers
    },
    evaluator: async (trigger) => {
        const eventType = trigger.metadata?.eventData?.eventType;
        return eventType ?? "不明";
    }
};
