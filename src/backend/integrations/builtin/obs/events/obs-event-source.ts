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
            name: "OBS 接続",
            description: "OBS WebSocket が接続されたとき",
            manualMetadata: {}
        },
        {
            id: OBS_DISCONNECTED_EVENT_ID,
            name: "OBS 切断",
            description: "OBS WebSocket が切断されたとき",
            manualMetadata: {}
        },
        {
            id: OBS_SCENE_CHANGED_EVENT_ID,
            name: "OBS シーン変更",
            description: "OBS でシーンが変更されたとき",
            manualMetadata: {
                sceneName: "テストシーン名"
            }
        },
        {
            id: OBS_STREAM_STARTED_EVENT_ID,
            name: "OBS 配信開始",
            description: "OBS で配信が正常に開始されたとき",
            manualMetadata: {}
        },
        {
            id: OBS_STREAM_STOPPED_EVENT_ID,
            name: "OBS 配信停止",
            description: "OBS で配信が停止したとき",
            manualMetadata: {}
        },
        {
            id: OBS_RECORDING_STARTED_EVENT_ID,
            name: "OBS 録画開始",
            description: "OBS で録画が正常に開始されたとき",
            manualMetadata: {}
        },
        {
            id: OBS_RECORDING_STOPPED_EVENT_ID,
            name: "OBS 録画停止",
            description: "OBS で録画が停止したとき",
            manualMetadata: {}
        },
        {
            id: OBS_SCENE_ITEM_ENABLE_STATE_CHANGED_EVENT_ID,
            name: "OBS シーンアイテム有効状態変更",
            description: "シーン内アイテムの有効/無効状態が変更されたとき",
            manualMetadata: {
                groupItemId: -1,
                groupName: "テストグループ名",
                sceneItemEnabled: true,
                sceneItemId: -1,
                sceneName: "テストシーン名"
            }
        },
        {
            id: OBS_SCENE_TRANSITION_STARTED_EVENT_ID,
            name: "OBS シーントランジション開始",
            description: "OBS のシーントランジションが開始されたとき",
            manualMetadata: {
                transitionName: "テストトランジション"
            }
        },
        {
            id: OBS_SCENE_TRANSITION_ENDED_EVENT_ID,
            name: "OBS シーントランジション終了",
            description: "OBS のシーントランジションが終了したとき",
            manualMetadata: {
                transitionName: "テストトランジション"
            }
        },
        {
            id: OBS_CURRENT_PROGRAM_SCENE_CHANGED_EVENT_ID,
            name: "OBS 現在プログラムシーン変更",
            description: "OBS の現在のプログラムシーンが変更されたとき",
            manualMetadata: {
                sceneName: "新しいシーン"
            }
        },
        {
            id: OBS_CURRENT_SCENE_TRANSITION_CHANGED_EVENT_ID,
            name: "OBS 現在シーントランジション変更",
            description: "OBS の現在シーントランジションが変更されたとき",
            manualMetadata: {
                transitionName: "テストトランジション"
            }
        },
        {
            id: OBS_CURRENT_SCENE_TRANSITION_DURATION_CHANGED_EVENT_ID,
            name: "OBS 現在シーントランジション時間変更",
            description: "OBS の現在シーントランジション時間が変更されたとき",
            manualMetadata: {
                transitionDuration: 1000
            }
        },
        {
            id: OBS_REPLAY_BUFFER_SAVED_EVENT_ID,
            name: "OBS リプレイバッファ保存",
            description: "OBS がリプレイバッファを保存したとき",
            manualMetadata: {}
        },
        {
            id: OBS_CURRENT_SCENE_COLLECTION_CHANGED_EVENT_ID,
            name: "OBS 現在シーンコレクション変更",
            description: "OBS の現在シーンコレクションが変更されたとき",
            manualMetadata: {
                sceneCollectionName: "新しいシーンコレクション"
            }
        },
        {
            id: OBS_CURRENT_PROFILE_CHANGED_EVENT_ID,
            name: "OBS 現在プロファイル変更",
            description: "OBS の現在プロファイルが変更されたとき",
            manualMetadata: {
                profileName: "テストプロファイル"
            }
        },
        {
            id: OBS_VENDOR_EVENT_EVENT_ID,
            name: "OBS ベンダーイベント",
            description: "サードパーティ製プラグインまたはスクリプトが OBS でイベントを発火したとき",
            manualMetadata: {
                vendorName: "テストベンダー",
                eventType: "テストイベント種別"
            }
        },
        {
            id: OBS_INPUT_CREATED_EVENT_ID,
            name: "OBS 入力作成",
            description: "OBS で入力が作成されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputKind: ""
            }
        },
        {
            id: OBS_INPUT_REMOVED_EVENT_ID,
            name: "OBS 入力削除",
            description: "OBS で入力が削除されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_NAME_CHANGED_EVENT_ID,
            name: "OBS 入力名変更",
            description: "OBS で入力名が変更されたとき",
            manualMetadata: {
                oldInputName: "",
                inputName: "マイク",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_SETTINGS_CHANGED_EVENT_ID,
            name: "OBS 入力設定変更",
            description: "OBS で入力設定が変更/更新されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_ACTIVE_STATE_CHANGED_EVENT_ID,
            name: "OBS 入力アクティブ状態変更",
            description: "OBS で入力のアクティブ状態が変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputActive: true
            }
        },
        {
            id: OBS_INPUT_SHOW_STATE_CHANGED_EVENT_ID,
            name: "OBS 入力表示状態変更",
            description: "OBS で入力の表示状態が変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputShowing: true
            }
        },
        {
            id: OBS_INPUT_MUTE_STATE_CHANGED_EVENT_ID,
            name: "OBS 入力ミュート状態変更",
            description: "OBS で入力のミュート状態が変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputMuted: true
            }
        },
        {
            id: OBS_INPUT_VOLUME_CHANGED_EVENT_ID,
            name: "OBS 入力音量レベル変更",
            description: "OBS で入力の音量レベルが変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputVolumeMultiplier: 0,
                inputVolumeDb: 0
            }
        },
        {
            id: OBS_INPUT_AUDIO_BALANCE_CHANGED_EVENT_ID,
            name: "OBS 入力オーディオバランス変更",
            description: "OBS で入力のオーディオバランスが変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputAudioBalance: 0
            }
        },
        {
            id: OBS_INPUT_AUDIO_SYNC_OFFSET_CHANGED_EVENT_ID,
            name: "OBS 入力音声同期オフセット変更",
            description: "OBS で入力の音声同期オフセットが変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                inputAudioSyncOffset: 0
            }
        },
        {
            id: OBS_INPUT_AUDIO_TRACKS_CHANGED_EVENT_ID,
            name: "OBS 入力オーディオトラック変更",
            description: "OBS で入力のオーディオトラックが変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: ""
            }
        },
        {
            id: OBS_INPUT_AUDIO_MONITOR_TYPE_CHANGED_EVENT_ID,
            name: "OBS 入力オーディオモニター種別変更",
            description: "OBS で入力のオーディオモニター種別が変更されたとき",
            manualMetadata: {
                inputName: "マイク",
                inputUuid: "",
                monitorType: {
                    type: "enum",
                    options: {
                        "OBS_MONITORING_TYPE_NONE": "なし",
                        "OBS_MONITORING_TYPE_MONITOR_ONLY": "モニターのみ",
                        "OBS_MONITORING_TYPE_MONITOR_AND_OUTPUT": "モニターと出力"
                    },
                    value: "OBS_MONITORING_TYPE_NONE"
                }
            }
        }
    ]
};