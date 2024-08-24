import { EventSource } from "../../../../../types/events";
import {
    OBS_CURRENT_PROFILE_CHANGED_EVENT_ID,
    OBS_CURRENT_PROGRAM_SCENE_CHANGED_EVENT_ID,
    OBS_CURRENT_SCENE_COLLECTION_CHANGED_EVENT_ID,
    OBS_CURRENT_SCENE_TRANSITION_CHANGED_EVENT_ID,
    OBS_CURRENT_SCENE_TRANSITION_DURATION_CHANGED_EVENT_ID,
    OBS_EVENT_SOURCE_ID,
    OBS_CONNECTED_EVENT_ID,
    OBS_DISCONNECTED_EVENT_ID,
    OBS_RECORDING_STARTED_EVENT_ID,
    OBS_RECORDING_STOPPED_EVENT_ID,
    OBS_REPLAY_BUFFER_SAVED_EVENT_ID,
    OBS_SCENE_CHANGED_EVENT_ID,
    OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID,
    OBS_SCENE_TRANSITION_ENDED_EVENT_ID,
    OBS_SCENE_TRANSITION_STARTED_EVENT_ID,
    OBS_STREAM_STARTED_EVENT_ID,
    OBS_STREAM_STOPPED_EVENT_ID,
    OBS_VENDOR_EVENT_EVENT_ID,
    OBS_INPUT_CREATED_EVENT_ID,
    OBS_INPUT_REMOVED_EVENT_ID,
    OBS_INPUT_NAME_CHANGED_EVENT_ID,
    OBS_INPUT_SETTINGS_CHANGED_EVENT_ID,
    OBS_INPUT_ACTIVE_STATE_CHANGED_EVENT_ID,
    OBS_INPUT_SHOW_STATE_CHANGED_EVENT_ID,
    OBS_INPUT_MUTE_STATE_CHANGED_EVENT_ID,
    OBS_INPUT_VOLUME_CHANGED_EVENT_ID,
    OBS_INPUT_AUDIO_BALANCE_CHANGED_EVENT_ID,
    OBS_INPUT_AUDIO_SYNC_OFFSET_CHANGED_EVENT_ID,
    OBS_INPUT_AUDIO_MONITOR_TYPE_CHANGED_EVENT_ID,
    OBS_INPUT_AUDIO_TRACKS_CHANGED_EVENT_ID
} from "../constants";

export const OBSEventSource: EventSource = {
    id: OBS_EVENT_SOURCE_ID,
    name: "OBS",
    events: [
        {
            id: OBS_CONNECTED_EVENT_ID,
            name: "OBSに接続したとき",
            description: "OBSウェブソケットが接続された場合",
            manualMetadata: {}
        },
        {
            id: OBS_DISCONNECTED_EVENT_ID,
            name: "OBSから切断されたとき",
            description: "OBSのウェブソケットが切断された場合",
            manualMetadata: {}
        },
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
            name: "OBS 現在の番組シーンが変わりました",
            description: "OBSで現在の番組シーンが変わったとき",
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
            name: "OBSで現在のシーンコレクションが変更されたとき",
            description: "OBSで現在のシーンコレクションが変更された場合",
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
        },
        {
            id: OBS_INPUT_CREATED_EVENT_ID,
            name: "OBSの入力が作成されたとき",
            description: "OBSでインプットが作成された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputKind: ""
            }
        },
        {
            id: OBS_INPUT_REMOVED_EVENT_ID,
            name: "OBSの入力が削除されたとき",
            description: "OBSで入力が削除された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_NAME_CHANGED_EVENT_ID,
            name: "OBSの入力名が変更されたとき",
            description: "OBSで入力名が変更された場合",
            manualMetadata: {
                oldInputName: "",
                inputName: "Microphone",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_SETTINGS_CHANGED_EVENT_ID,
            name: "OBSの入力設定が変更されたとき",
            description: "OBSで入力の設定が変更／更新された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_ACTIVE_STATE_CHANGED_EVENT_ID,
            name: "OBSの入力有効／無効状態が変化したとき",
            description: "OBSで入力のアクティブ状態が変化したとき",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputActive: true
            }
        },
        {
            id: OBS_INPUT_SHOW_STATE_CHANGED_EVENT_ID,
            name: "OBSの入力表示状態が変更されたとき",
            description: "OBSで入力の表示状態が変わったとき",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputShowing: true
            }
        },
        {
            id: OBS_INPUT_MUTE_STATE_CHANGED_EVENT_ID,
            name: "OBS 入力ミュート状態が変更されたとき",
            description: "OBSで入力のミュート状態が変わったとき",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputMuted: true
            }
        },
        {
            id: OBS_INPUT_VOLUME_CHANGED_EVENT_ID,
            name: "OBS入力音量レベルが変更されたとき",
            description: "OBSで入力の音量レベルが変化した場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputVolumeMultiplier: 0,
                inputVolumeDb: 0
            }
        },
        {
            id: OBS_INPUT_AUDIO_BALANCE_CHANGED_EVENT_ID,
            name: "OBS入力オーディオバランスが変更",
            description: "OBSで入力のオーディオバランスが変更された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputAudioBalance: 0
            }
        },
        {
            id: OBS_INPUT_AUDIO_SYNC_OFFSET_CHANGED_EVENT_ID,
            name: "OBS入力オーディオ同期オフセット変更",
            description: "OBSで入力のオーディオ同期オフセットが変更された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                inputAudioSyncOffset: 0
            }
        },
        {
            id: OBS_INPUT_AUDIO_TRACKS_CHANGED_EVENT_ID,
            name: "OBS入力オーディオトラック変更",
            description: "OBSで入力のオーディオトラックが変更された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_AUDIO_MONITOR_TYPE_CHANGED_EVENT_ID,
            name: "OBS入力オーディオモニタータイプ変更",
            description: "OBSで入力のオーディオモニタータイプが変更された場合",
            manualMetadata: {
                inputName: "Microphone",
                inputUuid: "",
                monitorType: {
                    type: "enum",
                    options: {
                        "OBS_MONITORING_TYPE_NONE": "None",
                        "OBS_MONITORING_TYPE_MONITOR_ONLY": "Monitor Only",
                        "OBS_MONITORING_TYPE_MONITOR_AND_OUTPUT": "Monitor and Output"
                    },
                    value: "OBS_MONITORING_TYPE_NONE"
                }
            }
        }
    ]
};