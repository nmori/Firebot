const { ComparisonType } = require("../../../../../shared/filter-constants");

import { EventFilter } from "../../../../../types/events";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_SCENE_CHANGED_EVENT_ID,
    OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID
} from "../constants";
const logger = require("../../../../logwrapper");

export const SceneNameEventFilter: EventFilter = {
    id: "ebiggz:obs-scene-name",
    name: "シーン名",
    events: [
        { eventSourceId: OBS_EVENT_SOURCE_ID, eventId: OBS_SCENE_CHANGED_EVENT_ID },
        { eventSourceId: OBS_EVENT_SOURCE_ID, eventId: OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID }
    ],
    description: "Filter on the name of the now active OBS scene",
    valueType: "preset",
    comparisonTypes: [
        ComparisonType.IS,
        ComparisonType.IS_NOT
    ],
    presetValues: (backendCommunicator: any, $q) => {
        return $q
            .when(backendCommunicator.fireEventAsync("obs-get-scene-list"))
            .then((scenes: string[]) =>
                scenes.map((s) => {
                    return {
                        value: s,
                        display: s
                    };
                })
            );
    },
    predicate: async ({ comparisonType, value }, { eventMeta }) => {
        const expected = value;
        const actual = eventMeta.sceneName;

        switch (comparisonType) {
            case ComparisonType.IS:
            case ComparisonType.COMPAT_IS:
            case ComparisonType.COMPAT2_IS:
            case ComparisonType.ORG_IS:
                return actual === expected;
            case ComparisonType.IS_NOT:
            case ComparisonType.COMPAT_IS_NOT:
            case ComparisonType.COMPAT2_IS_NOT:
            case ComparisonType.ORG_IS_NOT:
                return actual !== expected;
            default:
                logger.warn(`(${name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};
