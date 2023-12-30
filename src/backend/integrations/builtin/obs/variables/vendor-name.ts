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

export const VendorNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsVendorName",
        description:
      "OBS のベンダーイベントをトリガーしたベンダーの名前。",
        possibleDataOutput: ["text"],
        triggers: triggers
    },
    evaluator: async (trigger) => {
        const vendorName = trigger.metadata?.eventData?.vendorName;
        return vendorName ?? "不明";
    }
};
