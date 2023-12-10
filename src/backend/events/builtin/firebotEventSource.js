"use strict";

/**
 * The firebot event source
 */
const firebotEventSource = {
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
            name: "チャットメッセージハイライト時",
            description: "オーバーレイ上でメッセージをハイライトされた時",
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
        }
    ]
};

module.exports = firebotEventSource;
