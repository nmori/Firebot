import { createPresetFilter } from "../../../../events/filters/filter-factory";
import { EventFilter } from "../../../../../types/events";
import {
    OBS_EVENT_SOURCE_ID,
    OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID
} from "../constants";

const filter: EventFilter = createPresetFilter({
    id: "ebiggz:obs-group-name",
    name: "グループ名",
    description: "イベントをトリガーしたアイテムを所有するグループ名でにフィルターをかける",
    events: [
        { eventSourceId: OBS_EVENT_SOURCE_ID, eventId: OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID }
    ],
    eventMetaKey: "groupName",
    allowIsNot: true,
    presetValues: async (backendCommunicator: any) => {
        const groups: string[] = backendCommunicator.fireEventSync("obs-get-group-list");
        return groups.map((g) => {
            return {
                value: g,
                display: g
            };
        });
    }
});

export default filter;
