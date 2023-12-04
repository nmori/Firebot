import { EventSource } from "../../../../../types/events";
import {
  OBS_EVENT_SOURCE_ID,
  OBS_SCENE_CHANGED_EVENT_ID,
  OBS_STREAM_STARTED_EVENT_ID,
  OBS_STREAM_STOPPED_EVENT_ID,
} from "../constants";

export const OBSEventSource: EventSource = {
  id: OBS_EVENT_SOURCE_ID,
  name: "OBS",
  events: [
    {
      id: OBS_SCENE_CHANGED_EVENT_ID,
      name: "シーン変更時",
      description: "OBSでシーンが変更されたとき",
      manualMetadata: {
        sceneName: "Test Scene Name",
      },
    },
    {
      id: OBS_STREAM_STARTED_EVENT_ID,
      name: "配信開始時",
      description: "OBSで配信が始まったとき",
      manualMetadata: {},
    },
    {
      id: OBS_STREAM_STOPPED_EVENT_ID,
      name: "配信終了時",
      description: "OBSで配信が終わったとき",
      manualMetadata: {},
    },
  ],
};
