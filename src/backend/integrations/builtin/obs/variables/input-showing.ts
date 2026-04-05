import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_INPUT_SHOW_STATE_CHANGED_EVENT_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_INPUT_SHOW_STATE_CHANGED_EVENT_ID}`
];
triggers["manual"] = true;

export const InputShowingVariable: ReplaceVariable = {
    definition: {
        handle: "obsInputShowing",
        description: "OBS 入力が現在表示中なら `true`、そうでなければ `false` を返します。",
        possibleDataOutput: ["bool"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: (trigger) => {
        const inputShowing = trigger.metadata?.eventData?.inputShowing;
        return inputShowing ?? false;
    }
};