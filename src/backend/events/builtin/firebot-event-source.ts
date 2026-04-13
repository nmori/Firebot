import { EventSource } from "../../../types/events";

export const FirebotEventSource: EventSource = {
    id: "firebot",
    name: "Firebot",
    description: "Firebot 内で発生するさまざまなイベントです。",
    events: [
        {
            id: "chat-connected",
            name: "Twitch 接続",
            description: "Firebot が Twitch に接続したとき。",
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
            name: "オーバーレイ接続",
            description: "Firebot オーバーレイが接続されたとき。",
            cached: false,
            manualMetadata: {
                instanceName: "デフォルト"
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
            name: "視聴時間更新",
            description: "視聴者の視聴時間が自動更新されたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                previousViewTime: 1,
                newViewTime: 2
            }
        },
        {
            id: "currency-update",
            name: "通貨更新",
            description: "視聴者の通貨が変化したとき。",
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
            name: "視聴者作成",
            description: "視聴者が Viewer Database に初めて保存されたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "firebot-started",
            name: "Firebot 起動",
            description: "Firebot が起動したとき。",
            cached: false
        },
        {
            id: "custom-variable-expired",
            name: "カスタム変数期限切れ",
            description: "カスタム変数の期限が切れたとき。",
            cached: false
        },
        {
            id: "custom-variable-set",
            name: "カスタム変数作成",
            description: "カスタム変数が作成されたとき。",
            cached: false
        },
        {
            id: "highlight-message",
            name: "チャットメッセージ強調表示",
            description: "Firebot のチャットフィードでメッセージを強調表示したとき。たとえばオーバーレイ表示に利用できます。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                messageText: "テストメッセージ"
            }
        },
        {
            id: "category-changed",
            name: "カテゴリ変更",
            description: "Firebot ダッシュボードで配信カテゴリを変更したとき。",
            cached: false,
            manualMetadata: {
                category: "雑談"
            }
        },
        {
            id: "effect-queue-cleared",
            name: "エフェクトキュー消去",
            description: "エフェクトキューの実行が完了してクリアされたとき。",
            cached: false,
            manualMetadata: {
                queueName: "雑談"
            }
        },
        {
            id: "effect-queue-added",
            name: "エフェクトキュー追加",
            description: "エフェクトキューに新しいエントリが追加されたとき。",
            cached: false,
            manualMetadata: {
                queueName: "雑談"
            }
        },
        {
            id: "effect-queue-status",
            name: "エフェクトキュー状態変更",
            description: "エフェクトキューの状態が変更されたとき。",
            cached: false,
            manualMetadata: {
                queueName: "雑談",
                status: "paused"
            }
        },
        {
            id: "before-firebot-closed",
            name: "Firebot 終了直前",
            description: "Firebot が終了する直前。",
            cached: false
        },
        {
            id: "viewer-rank-updated",
            name: "視聴者ランク更新",
            description: "ランクラダー内で視聴者のランクが更新されたとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                rankLadderName: "ランクラダー",
                newRankName: "新しいランク",
                previousRankName: "前のランク",
                isPromotion: true,
                isDemotion: false
            }
        },
        {
            id: "viewer-metadata-updated",
            name: "視聴者メタデータ更新",
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
            name: "ウェブフック受信",
            description: "プロキシされたウェブフックを受信したとき。ウェブフックは設定の詳細タブでセットアップできます。",
            cached: false,
            manualMetadata: {
                webhookId: "testWebhookId",
                webhookName: "テストウェブフック",
                webhookPayload: {
                    foo: "bar"
                },
                webhookRawPayload: "{ \"foo\": \"bar\" }"
            }
        },
        {
            id: "dynamic-countdown-finished",
            name: "カウントダウン（動的）終了",
            description: "動的カウントダウンが 0 に達したとき。",
            cached: false,
            manualMetadata: {
                dynamicCountdownWidgetId: "testCountdownId",
                dynamicCountdownWidgetName: "テストカウントダウン"
            }
        },
        {
            id: "custom-widget-message-received",
            name: "カスタムオーバーレイウィジェットメッセージ受信",
            description: "カスタムオーバーレイウィジェットからメッセージを受信したとき。",
            cached: false,
            manualMetadata: {
                customWidgetId: "testCountdownId",
                customWidgetName: "テストカウントダウン",
                messageName: "テストメッセージ",
                messageData: {
                    foo: "bar"
                }
            }
        }
    ]
};