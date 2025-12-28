import { EventSource } from "../../../types/events";

export const FirebotEventSource: EventSource = {
    id: "firebot",
    name: "Firebot",
    description: "Firebot 内で発生する可能性のある重要なイベント",
    events: [
        {
            id: "chat-connected",
            name: "Twitch 接続時",
            description: "FirebotがTwitchに接続したとき",
            cached: false,
            activityFeed: {
                icon: "fad fa-plug",
                getMessage: () => {
                    return `Twitch に接続しました`;
                }
            }
        },
        {
            id: "overlay-connected",
            name: "オーバーレイ接続時",
            description: "Firebotオーバーレイが接続されたとき。",
            cached: false,
            manualMetadata: {
                instanceName: "Default"
            },
            activityFeed: {
                icon: "fad fa-tv-alt",
                getMessage: (eventData) => {
                    return `**${eventData.instanceName}** オーバーレイが接続されました`;
                }
            }
        },
        {
            id: "view-time-update",
            name: "時間情報更新時",
            description: "視聴時間が更新されたとき",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                previousViewTime: 1,
                newViewTime: 2
            }
        },
        {
            id: "currency-update",
            name: "通貨更新時",
            description: "視聴者の通貨が変わったとき",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                currencyName: "コイン",
                previousCurrencyAmount: 1,
                newCurrencyAmount: 2
            }
        },
        {
            id: "viewer-created",
            name: "視聴者情報追加時",
            description: "視聴者が最初に視聴者データベースに保存されるとき",
            cached: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "firebot-started",
            name: "Firebot 起動時",
            description: "Firebotが起動したとき",
            cached: false
        },
        {
            id: "custom-variable-expired",
            name: "カスタム変数の有効期限切れ時",
            description: "カスタム変数の有効期限が切れたとき",
            cached: false
        },
        {
            id: "custom-variable-set",
            name: "カスタム変数の作成時",
            description: "カスタム変数が作成されたとき",
            cached: false
        },
        {
            id: "highlight-message",
            name: "チャットスポットライト時",
            description: "オーバーレイ表示など、メッセージにスポットライトを当てた時",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                messageText: "テストメッセージ"
            }
        },
        {
            id: "category-changed",
            name: "カテゴリー変更時",
            description: "ダッシュボードで配信カテゴリーを変更した時",
            cached: false,
            manualMetadata: {
                category: "Just Chatting"
            }
        },
        {
            id: "effect-queue-cleared",
            name: "演出キューがクリアされたとき",
            description: "演出キューの実行が終了し、クリアされたとき",
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting"
            }
        },
        {
            id: "effect-queue-added",
            name: "演出キュー追加",
            description: "演出キューに新しい項目が追加されたとき。",
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting"
            }
        },
        {
            id: "effect-queue-status",
            name: "演出キューのステータス変更",
            description: "演出キューのステータスが変更されたとき。",
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting",
                status: "paused"
            }
        },
        {
            id: "before-firebot-closed",
            name: "Firebotが終了するとき",
            description: "Firebotが終了するとき",
            cached: false
        },
        {
            id: "viewer-rank-updated",
            name: "視聴者ランクが更新されたとき",
            description: "視聴者のランクが更新されたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                rankLadderName: "Rank Ladder",
                newRankName: "New Rank",
                previousRankName: "Previous Rank",
                isPromotion: true,
                isDemotion: false
            }
        },
        {
            id: "viewer-metadata-updated",
            name: "視聴者メタデータ更新時",
            description: "視聴者のメタデータ値が更新されたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                metadataKey: "testKey",
                metadataValue: "testValue"
            }
        },
        {
            id: "webhook-received",
            name: "Webhook受信時",
            description: "プロキシ経由のWebhookを受信したとき。Webhookは設定の詳細タブで設定できます。",
            cached: false,
            manualMetadata: {
                webhookId: "testWebhookId",
                webhookName: "Test Webhook",
                webhookPayload: {
                    foo: "bar"
                }
            }
        },
        {
            id: "dynamic-countdown-finished",
            name: "カウントダウン（動的）終了時",
            description: "動的カウントダウンがゼロに達したとき。",
            cached: false,
            manualMetadata: {
                countdownWidgetId: "testCountdownId",
                countdownWidgetName: "Test Countdown"
            }
        }
    ]
};