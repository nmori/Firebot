import { ReplaceVariable, TriggersObject } from "../../../../../types/variables";
import {
    OBS_CURRENT_SCENE_TRANSITION_DURATION_CHANGED_EVENT_ID,
    OBS_EVENT_SOURCE_ID
} from "../constants";

const triggers: TriggersObject = {};
triggers["event"] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_CURRENT_SCENE_TRANSITION_DURATION_CHANGED_EVENT_ID}`
];

export const TransitionDurationVariable: ReplaceVariable = {
    definition: {
        handle: "obsTransitionDuration",
        description:
            "更新された OBS トランジションの新しい長さ（ミリ秒）です。",
        possibleDataOutput: ["number"],
        categories: ["advanced", "integrations", "obs"],
        triggers: triggers
    },
    evaluator: (trigger) => {
        const transitionDuration = trigger.metadata?.eventData?.transitionDuration;
        return transitionDuration ?? 0;
    }
};