import { TriggerType } from "../../../../common/EffectType";
import { ReplaceVariable } from "../../../../../types/variables";
import {
    OBS_CURRENT_SCENE_TRANSITION_CHANGED_EVENT_ID,
    OBS_EVENT_SOURCE_ID,
    OBS_SCENE_TRANSITION_ENDED_EVENT_ID,
    OBS_SCENE_TRANSITION_STARTED_EVENT_ID
} from "../constants";

const triggers = {};
triggers[TriggerType.EVENT] = [
    `${OBS_EVENT_SOURCE_ID}:${OBS_SCENE_TRANSITION_STARTED_EVENT_ID}`,
    `${OBS_EVENT_SOURCE_ID}:${OBS_SCENE_TRANSITION_ENDED_EVENT_ID}`,
    `${OBS_EVENT_SOURCE_ID}:${OBS_CURRENT_SCENE_TRANSITION_CHANGED_EVENT_ID}`
];

export const TransitionNameVariable: ReplaceVariable = {
    definition: {
        handle: "obsTransitionName",
        description:
      "イベントをトリガーした OBS トランジションの名前。",
        possibleDataOutput: ["text"],
        triggers: triggers
    },
    evaluator: async (trigger) => {
        const transitionName = trigger.metadata?.eventData?.transitionName;
        return transitionName ?? "不明";
    }
};
