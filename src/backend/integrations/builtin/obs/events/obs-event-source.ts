import { EventSource } from "../../../../../types/events";
import {
    OBS_CURRENT_PROFILE_CHANGED_EVENT_ID,
    OBS_CURRENT_PROGRAM_SCENE_CHANGED_EVENT_ID,
    OBS_CURRENT_SCENE_COLLECTION_CHANGED_EVENT_ID,
    OBS_CURRENT_SCENE_TRANSITION_CHANGED_EVENT_ID,
    OBS_CURRENT_SCENE_TRANSITION_DURATION_CHANGED_EVENT_ID,
    OBS_EVENT_SOURCE_ID,
    OBS_RECORDING_STARTED_EVENT_ID,
    OBS_RECORDING_STOPPED_EVENT_ID,
    OBS_REPLAY_BUFFER_SAVED_EVENT_ID,
    OBS_SCENE_CHANGED_EVENT_ID,
    OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID,
    OBS_SCENE_TRANSITION_ENDED_EVENT_ID,
    OBS_SCENE_TRANSITION_STARTED_EVENT_ID,
    OBS_STREAM_STARTED_EVENT_ID,
    OBS_STREAM_STOPPED_EVENT_ID,
    OBS_VENDOR_EVENT_EVENT_ID
} from "../constants";

export const OBSEventSource: EventSource = {
    id: OBS_EVENT_SOURCE_ID,
    name: "OBS",
    events: [
        {
            id: OBS_SCENE_CHANGED_EVENT_ID,
            name: "OBS のシーンが変更された時",
            description: "OBSでシーンが変わるとき",
            manualMetadata: {
                sceneName: "Test Scene Name"
            }
        },
        {
            id: OBS_STREAM_STARTED_EVENT_ID,
            name: "OBSで配信が始まった時",
            description: "OBSでストリームが正常に開始された場合",
            manualMetadata: {}
        },
        {
            id: OBS_STREAM_STOPPED_EVENT_ID,
            name: "OBSでの配信が終わった時",
            description: "OBSでストリームが停止した場合",
            manualMetadata: {}
        },
        {
            id: OBS_RECORDING_STARTED_EVENT_ID,
            name: "OBSで録画が始まった時",
            description: "OBSで録画が正常に開始された場合",
            manualMetadata: {}
        },
        {
            id: OBS_RECORDING_STOPPED_EVENT_ID,
            name: "OBSでの録画が止まった時",
            description: "When recording has stopped in OBS",
            manualMetadata: {}
        },
        {
            id: OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID,
            name: "OBS シーンアイテムの有効状態に変化",
            description: "シーン内のアイテムが有効／無効になったとき",
            manualMetadata: {}
        },
        {
            id: OBS_SCENE_TRANSITION_STARTED_EVENT_ID,
            name: "OBSシーン切り替え開始",
            description: "OBSのシーン遷移が始まったとき",
            manualMetadata: {
                transitionName: "Test Transition"
            }
        },
        {
            id: OBS_SCENE_TRANSITION_ENDED_EVENT_ID,
            name: "OBSシーン切り替え終了",
            description: "OBSのシーン遷移が終了した場合",
            manualMetadata: {
                transitionName: "Test Transition"
            }
        },
        {
            id: OBS_CURRENT_PROGRAM_SCENE_CHANGED_EVENT_ID,
            name: "OBS Current Program Scene Changed",
            description: "When the current program scene has changed in OBS",
            manualMetadata: {
                sceneName: "New Scene"
            }
        },
        {
            id: OBS_CURRENT_SCENE_TRANSITION_CHANGED_EVENT_ID,
            name: "現在のOBSシーントランジションを変更",
            description: "OBSの現在のシーントランジションが変わったとき",
            manualMetadata: {
                transitionName: "Test Transition"
            }
        },
        {
            id: OBS_CURRENT_SCENE_TRANSITION_DURATION_CHANGED_EVENT_ID,
            name: "OBS 現在のシーン切り替え時間が変更",
            description: "OBSの現在のシーン遷移時間が変更された場合",
            manualMetadata: {
                transitionDuration: 1000
            }
        },
        {
            id: OBS_REPLAY_BUFFER_SAVED_EVENT_ID,
            name: "OBSリプレイバッファが保存されたとき",
            description: "OBSがリプレーバッファを保存するとき",
            manualMetadata: {}
        },
        {
            id: OBS_CURRENT_SCENE_COLLECTION_CHANGED_EVENT_ID,
            name: "OBS Current Scene Collection Changed",
            description: "When the current scene collection is changed in OBS",
            manualMetadata: {
                sceneCollectionName: "New Scene Collection"
            }
        },
        {
            id: OBS_CURRENT_PROFILE_CHANGED_EVENT_ID,
            name: "OBS現在のプロファイルが変更された時",
            description: "OBSで現在のプロファイルが変更された場合",
            manualMetadata: {
                profileName: "Test Profile"
            }
        },
        {
            id: OBS_VENDOR_EVENT_EVENT_ID,
            name: "OBS ベンダーイベントが発生",
            description: "サードパーティのプラグインやスクリプトがOBSでイベントを発する場合",
            manualMetadata: {
                vendorName: "Test Vendor",
                eventType: "Test Event Type"
            }
        }
    ]
};