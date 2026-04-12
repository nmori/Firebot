import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_ACTIVE_STATE_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_ACTIVE_STATE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputActiveVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputActive",
        description: "OBS 入力がアクティブなら `true`、そうでなければ `false` を返します。",
        possibleDataOutput: ["bool"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputActive = trigger.metadata?.eventData?.inputActive;
        return inputActive ?? false;
    }
};