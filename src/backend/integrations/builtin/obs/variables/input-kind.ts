import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_CREATED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_CREATED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputKindVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputKind",
        description: "OBS 入力種別の OBS 内部名を返します。",
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputKind = trigger.metadata?.eventData?.inputKind;
        return inputKind ?? "Unknown";
    }
};