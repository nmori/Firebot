/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import escape from "escape-html";

import type { EventSource } from "../../../../types/events";

import * as ad from "./ad";
import * as announcement from "./announcement";
import * as bits from "./bits";
import * as charity from "./charity";
import * as chat from "./chat";
import * as chatMessage from "./chat-message";
import * as chatModeChanged from "./chat-mode-changed";
import * as follow from "./follow";
import * as giftSub from "./gift-sub";
import * as goal from "./goal";
import * as hypeTrain from "./hype-train";
import * as poll from "./poll";
import * as prediction from "./prediction";
import * as raid from "./raid";
import * as rewardRedemption from "./reward-redemption";
import * as shoutout from "./shoutout";
import * as stream from "./stream";
import * as sub from "./sub";
import * as viewerArrived from "./viewer-arrived";
import * as viewerBanned from "./viewer-banned";
import * as viewerTimeout from "./viewer-timeout";
import * as whisper from "./whisper";

export const TwitchEventHandlers = {
    ad,
    announcement,
    bits,
    charity,
    chat,
    chatMessage,
    chatModeChanged,
    follow,
    giftSub,
    goal,
    hypeTrain,
    poll,
    prediction,
    raid,
    rewardRedemption,
    shoutout,
    stream,
    sub,
    viewerArrived,
    viewerBanned,
    viewerTimeout,
    whisper
};

export const TwitchEventSource: EventSource = {
    id: "twitch",
    name: "Twitch",
    description: "フォロー、サブスクライブなどの Twitch イベント",
    events: [
        {
            id: "raid",
            name: "受信レイド",
            description: "誰かがあなたのチャンネルにレイドしたとき。",
            cached: true,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                viewerCount: 5
            },
            activityFeed: {
                icon: "fad fa-inbox-in",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.viewerCount}** 人の視聴者とレイドしました`;
                }
            }
        },
        {
            id: "outgoing-raid-started",
            name: "送信レイド開始",
            description: "あなたまたはモデレーターが他チャンネルへの送信レイドを開始したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userId: "",
                userDisplayName: "Firebot",
                raidTargetUsername: "user",
                raidTargetUserId: "",
                raidTargetUserDisplayName: "User",
                moderator: "BestMod",
                viewerCount: 5
            },
            activityFeed: {
                icon: "fad fa-inbox-out",
                getMessage: (eventData) => {
                    return `**${eventData.moderator}** が **${eventData.raidTargetUserDisplayName}** へのレイドを開始（視聴者 **${
                        eventData.viewerCount
                    }** 人）`;
                }
            }
        },
        {
            id: "outgoing-raid-canceled",
            name: "送信レイドキャンセル",
            description: "あなたまたはモデレーターが他チャンネルへの送信レイドをキャンセルしたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userId: "",
                userDisplayName: "Firebot",
                raidTargetUsername: "user",
                raidTargetUserId: "",
                raidTargetUserDisplayName: "User",
                moderator: "BestMod"
            },
            activityFeed: {
                icon: "fad fa-undo",
                getMessage: (eventData) => {
                    return `**${eventData.moderator}** が **${eventData.raidTargetUserDisplayName}** へのレイドをキャンセルしました`;
                }
            }
        },
        {
            id: "raid-sent-off",
            name: "送信レイド完了",
            description: "送信レイドが完了したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userId: "",
                userDisplayName: "Firebot",
                raidTargetUsername: "user",
                raidTargetUserId: "",
                raidTargetUserDisplayName: "User",
                viewerCount: 5
            },
            activityFeed: {
                icon: "fad fa-inbox-out",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.raidTargetUserDisplayName}** に **${
                        eventData.viewerCount
                    }** 人でレイド中`;
                }
            }
        },
        {
            id: "follow",
            name: "フォロー",
            description: "誰かがあなたのチャンネルをフォローしたとき。",
            cached: true,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: ""
            },
            activityFeed: {
                icon: "fas fa-heart",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** がフォローしました`;
                }
            }
        },
        {
            id: "sub",
            name: "サブスク",
            description: "誰かがあなたのチャンネルをサブスクライブ（再サブスク含む）したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                isPrime: false,
                isResub: false,
                subPlan: {
                    type: "enum",
                    options: {
                        Prime: "Prime",
                        1000: "Tier 1",
                        2000: "Tier 2",
                        3000: "Tier 3"
                    },
                    value: "1000"
                },
                subMessage: "テストメッセージ",
                totalMonths: 10,
                streak: 8
            },
            activityFeed: {
                icon: "fas fa-star",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""}** ${
                        eventData.isResub ? "再サブスク" : "サブスク"
                    } for **${eventData.totalMonths} month(s)** ${
                        eventData.subPlan === "Prime"
                            ? "（**Twitch Prime**）"
                            : `（**Tier ${eventData.subPlan.replace("000", "")}**）`
                    }`;
                }
            }
        },
        {
            id: "prime-sub-upgraded",
            name: "Primeサブスクアップグレード",
            description: "誰かが Prime サブスクから有料サブスクへアップグレードしたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                subPlan: {
                    type: "enum",
                    options: {
                        1000: "Tier 1",
                        2000: "Tier 2",
                        3000: "Tier 3"
                    },
                    value: "1000"
                }
            },
            activityFeed: {
                icon: "fas fa-star",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が Prime サブスクを **Tier ${eventData.subPlan.replace("000", "")}** にアップグレードしました`;
                }
            }
        },
        {
            id: "subs-gifted",
            name: "サブスクギフト",
            description: "誰かがあなたのチャンネル内で他の人にサブスクをギフトしたとき。",
            cached: false,
            manualMetadata: {
                gifterUsername: "Firebot",
                isAnonymous: false,
                subPlan: {
                    type: "enum",
                    options: {
                        1000: "Tier 1",
                        2000: "Tier 2",
                        3000: "Tier 3"
                    },
                    value: "1000"
                },
                giftDuration: 1,
                gifteeUsername: "MageEnclave",
                lifetimeGiftCount: 1
            },
            activityFeed: {
                icon: "fad fa-gift",
                getMessage: (eventData) => {
                    return `**${eventData.isAnonymous ? "匿名ギフター" : eventData.gifterUsername}** が **${
                        eventData.giftDuration > 1 ? `${eventData.giftDuration}か月 ` : ""
                    }Tier ${eventData.subPlan.replace("000", "")}** サブスクを **${
                        eventData.gifteeUsername
                    }** にギフトしました`;
                }
            }
        },
        {
            id: "community-subs-gifted",
            name: "コミュニティ向けサブスクギフト",
            description: "誰かがチャンネルコミュニティにランダムサブスクをギフトしたとき。",
            cached: false,
            manualMetadata: {
                gifterUsername: "Firebot",
                isAnonymous: false,
                subCount: 5,
                subPlan: {
                    type: "enum",
                    options: {
                        1000: "Tier 1",
                        2000: "Tier 2",
                        3000: "Tier 3"
                    },
                    value: "1000"
                },
                giftReceivers: {
                    type: "gift-receivers-list",
                    value: [
                        { gifteeUsername: "User1" },
                        { gifteeUsername: "User2" },
                        { gifteeUsername: "User3" },
                        { gifteeUsername: "User4" },
                        { gifteeUsername: "User5" }
                    ]
                },
                lifetimeGiftCount: 5
            },
            activityFeed: {
                icon: "fad fa-gifts",
                getMessage: (eventData) => {
                    return `**${eventData.isAnonymous ? "匿名ギフター" : eventData.gifterUsername}** がコミュニティに **${
                        eventData.subCount
                    } 件の Tier ${eventData.subPlan.replace("000", "")}** サブスクをギフトしました`;
                }
            }
        },
        {
            id: "gift-sub-upgraded",
            name: "ギフトサブスクアップグレード",
            description: "誰かがギフトサブスクから有料サブスクへアップグレードしたとき。",
            cached: false,
            manualMetadata: {
                username: "cavemobster",
                userDisplayName: "CaveMobster",
                userId: "",
                gifteeUsername: "CaveMobster",
                gifterUsername: "Firebot",
                subPlan: {
                    type: "enum",
                    options: {
                        1000: "Tier 1",
                        2000: "Tier 2",
                        3000: "Tier 3"
                    },
                    value: "1000"
                }
            },
            activityFeed: {
                icon: "fas fa-star",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** がギフトサブスクを **Tier ${eventData.subPlan.replace("000", "")}** にアップグレードしました`;
                }
            }
        },
        {
            id: "cheer",
            name: "チアー",
            description: "誰かがあなたのチャンネルでチアー（Bits 使用）したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                isAnonymous: false,
                bits: 100,
                totalBits: 1200,
                cheerMessage: "cheer100 テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.bits}** Bits をチアーしました。累計 **${
                        eventData.totalBits
                    }** Bits です。`;
                }
            }
        },
        {
            id: "bits-badge-unlocked",
            name: "Bitsバッジ解除",
            description: "誰かがあなたのチャンネルで新しい Bits バッジ階級を解除したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                message: "テストメッセージ",
                badgeTier: {
                    type: "enum",
                    options: {
                        1: "1",
                        100: "100",
                        1000: "1k",
                        5000: "5k",
                        10000: "10k",
                        25000: "25k",
                        50000: "50k",
                        75000: "75k",
                        100000: "100k",
                        200000: "200k",
                        300000: "300k",
                        400000: "400k",
                        500000: "500k",
                        600000: "600k",
                        700000: "700k",
                        800000: "800k",
                        900000: "900k",
                        1000000: "1M",
                        1250000: "1.25M",
                        1500000: "1.5M",
                        1750000: "1.75M",
                        2000000: "2M",
                        2500000: "2.5M",
                        3000000: "3M",
                        3500000: "3.5M",
                        4000000: "4M",
                        4500000: "4.5M",
                        5000000: "5M"
                    },
                    value: "1000"
                }
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** がこのチャンネルで **${eventData.badgeTier}** Bits バッジを解除しました！`;
                }
            }
        },
        {
            id: "bits-powerup-message-effect",
            name: "パワーアップ: メッセージエフェクト",
            description: "視聴者があなたのチャンネルで「Message Effects」パワーアップを使用したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                bits: 30,
                totalBits: 1200,
                cheerMessage: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                    }** が Message Effects パワーアップを使用（**${eventData.bits}** Bits）`;
                }
            }
        },
        {
            id: "bits-powerup-celebration",
            name: "パワーアップ: 画面演出セレブレーション",
            description: "視聴者があなたのチャンネルで「On-Screen Celebration」パワーアップを使用したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                bits: 50,
                totalBits: 1200
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                    }** が Celebration パワーアップを使用（**${eventData.bits}** Bits）`;
                }
            }
        },
        {
            id: "bits-powerup-gigantified-emote",
            name: "パワーアップ: エモート巨大化",
            description: "視聴者があなたのチャンネルで「Gigantify an Emote」パワーアップを使用したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                bits: 20,
                totalBits: 1200,
                cheerMessage: "テストメッセージ",
                emoteName: "PogChamp",
                emoteUrl: "https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/3.0"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.emoteName}** エモートを巨大化（**${eventData.bits}** Bits）`;
                }
            }
        },
        {
            id: "viewer-arrived",
            name: "視聴者来訪",
            description: "視聴者が配信で初めてチャットしたとき。",
            cached: true,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: ""
            },
            activityFeed: {
                icon: "fad fa-house-return",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が来訪しました`;
                }
            }
        },
        {
            id: "chat-cleared",
            name: "チャット全削除",
            description: "あなたのチャンネルでチャットが一括削除されたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userId: ""
            }
        },
        {
            id: "chat-message",
            name: "チャットメッセージ",
            description: "誰かがあなたのチャンネルでチャットしたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                messageText: "テストメッセージ"
            }
        },
        {
            id: "chat-message-deleted",
            name: "チャットメッセージ削除",
            description: "あなたのチャンネルでチャットメッセージが削除されたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                messageText: "テストメッセージ"
            }
        },
        {
            id: "first-time-chat",
            name: "初回チャット",
            description: "誰かがあなたのチャンネルで初めてチャットしたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                messageText: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-sparkles",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** がこのチャンネルで初めてチャットしました`;
                }
            }
        },
        {
            id: "announcement",
            name: "アナウンス",
            description: "あなたまたはモデレーターがチャンネルでアナウンスを送信したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                messageText: "テストアナウンス"
            }
        },
        {
            id: "banned",
            name: "視聴者BAN",
            description: "あなたのチャンネルで誰かが BAN されたとき。",
            cached: false,
            manualMetadata: {
                username: "cavemobster",
                userDisplayName: "CaveMobster",
                userId: "",
                moderator: "Firebot",
                modReason: "They were extra naughty"
            },
            activityFeed: {
                icon: "fad fa-gavel",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    let message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.moderator}** により BAN されました`;

                    if (eventData.modReason) {
                        message = `${message}。理由: **${escape(eventData.modReason)}**`;
                    }
                    return message;
                }
            }
        },
        {
            id: "unbanned",
            name: "視聴者BAN解除",
            description: "あなたのチャンネルで誰かの BAN が解除されたとき。",
            cached: false,
            manualMetadata: {
                username: "cavemobster",
                userDisplayName: "CaveMobster",
                userId: "",
                moderator: "Firebot"
            },
            activityFeed: {
                icon: "fad fa-gavel",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** の BAN が **${eventData.moderator}** により解除されました`;
                }
            }
        },
        {
            id: "timeout",
            name: "視聴者タイムアウト",
            description: "あなたのチャンネルで誰かがタイムアウトされたとき。",
            cached: false,
            manualMetadata: {
                username: "alca",
                userDisplayName: "Alca",
                userId: "",
                timeoutDuration: "1",
                moderator: "Firebot",
                modReason: "They were naughty"
            },
            activityFeed: {
                icon: "fad fa-stopwatch",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    let message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.moderator}** により **${eventData.timeoutDuration} 秒**タイムアウトされました`;

                    if (eventData.modReason) {
                        message = `${message}。理由: **${escape(eventData.modReason)}**`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption",
            name: "チャンネル報酬引き換え",
            description: "誰かがカスタムのチャンネル報酬を引き換えたとき。",
            cached: true,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "テスト報酬",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: 200,
                messageText: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.rewardName}** を引き換え${
                        eventData.messageText && !!eventData.messageText.length ? `: *${escape(eventData.messageText)}*` : ""
                    }`;
                },
                excludeFromChatFeed: true
            }
        },
        {
            id: "channel-reward-redemption-fulfilled",
            name: "チャンネル報酬引き換え承認",
            description: "カスタムのチャンネル報酬引き換えが完了/承認されたとき。",
            cached: false,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "テスト報酬",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: 200,
                messageText: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** の **${eventData.rewardName}** 引き換えが承認されました。${
                        eventData.messageText && !!eventData.messageText.length ? `*${escape(eventData.messageText)}*` : ""
                    }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-canceled",
            name: "チャンネル報酬引き換え却下",
            description: "カスタムのチャンネル報酬引き換えが却下/返金されたとき。",
            cached: false,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "テスト報酬",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: 200,
                messageText: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** の **${eventData.rewardName}** 引き換えが却下されました。${
                        eventData.messageText && !!eventData.messageText.length ? `*${escape(eventData.messageText)}*` : ""
                    }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-single-message-bypass-sub-mode",
            name: "チャンネル報酬引き換え: サブ限モードでメッセージ送信",
            description: "誰かが「Send a Message in Sub-Only Mode」を引き換えてあなたのチャンネルに投稿したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                messageText: "テストメッセージ",
                rewardDescription: "Send a Message in Sub-Only Mode"
            },
            activityFeed: {
                icon: "fad fa-arrow-right",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **Send a Message in Sub-Only Mode** を引き換えました`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-send-highlighted-message",
            name: "チャンネル報酬引き換え: メッセージハイライト",
            description: "誰かがあなたのチャンネルで「Highlight My Message」を引き換えたとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                messageText: "テストメッセージ",
                rewardDescription: "Highlight My Message"
            },
            activityFeed: {
                icon: "fad fa-highlighter",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **Highlight My Message** を引き換えました`;
                    return message;
                },
                excludeFromChatFeed: true
            }
        },
        {
            id: "channel-reward-redemption-random-sub-emote-unlock",
            name: "チャンネル報酬引き換え: ランダムサブエモート解除",
            description: "誰かが「Unlock a Random Sub Emote」を引き換えてあなたのチャンネルのエモートを解除したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                emoteName: "PogChamp",
                emoteUrl: "https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/3.0",
                rewardDescription: "Unlock a Random Sub Emote"
            },
            activityFeed: {
                icon: "fad fa-images",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **Unlock a Random Sub Emote** を引き換えました`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-chosen-sub-emote-unlock",
            name: "チャンネル報酬引き換え: エモート指定解除",
            description: "誰かが「Choose an Emote to Unlock」を引き換えてあなたのチャンネルのエモートを解除したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                emoteName: "PogChamp",
                emoteUrl: "https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/3.0",
                rewardDescription: "Choose an Emote to Unlock"
            },
            activityFeed: {
                icon: "fad fa-images",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **Choose an Emote to Unlock** を引き換えました`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-chosen-modified-sub-emote-unlock",
            name: "チャンネル報酬引き換え: 単一エモート編集",
            description: "誰かが「Modify a Single Emote」を引き換えてあなたのチャンネルのエモートを編集・解除したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                emoteName: "PogChamp",
                emoteUrl: "https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/3.0",
                rewardDescription: "Modify a Single Emote"
            },
            activityFeed: {
                icon: "fad fa-images",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **Modify a Single Emote** を引き換えました`;
                    return message;
                }
            }
        },
        {
            id: "whisper",
            name: "ウィスパー",
            description: "誰かがあなたまたは Bot アカウントにウィスパーを送信したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                message: "テストウィスパー",
                sentTo: {
                    type: "enum",
                    options: {
                        streamer: "配信者",
                        bot: "Bot"
                    },
                    value: "streamer"
                }
            },
            activityFeed: {
                icon: "fad fa-comment-alt",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** が **${eventData.sentTo}** アカウントへウィスパーを送信: ${escape(eventData.message)}`;
                }
            }
        },
        {
            id: "chat-mode-changed",
            name: "チャットモード変更",
            description: "モデレーターによってチャットモード設定が更新されたとき。",
            cached: false,
            manualMetadata: {
                chatMode: {
                    type: "enum",
                    options: {
                        emoteonly: "エモートのみ",
                        subscribers: "サブスク限定",
                        followers: "フォロワー限定",
                        slow: "低速",
                        uniquechat: "重複メッセージ禁止"
                    },
                    value: "emoteonly"
                },
                chatModeState: {
                    type: "enum",
                    options: {
                        enabled: "有効",
                        disabled: "無効"
                    },
                    value: "enabled"
                },
                moderator: "Firebot",
                duration: "30"
            },
            activityFeed: {
                icon: "fad fa-comment-alt",
                getMessage: (eventData) => {
                    return `**${eventData.moderator}** がチャットモードを **${eventData.chatMode}** に設定しました`;
                }
            }
        },
        {
            id: "channel-poll-begin",
            name: "チャンネル投票開始",
            description: "あなたのチャンネルで投票が開始されたとき。",
            cached: false,
            manualMetadata: {
                choices: {
                    options: { hideVotes: true },
                    type: "poll-choice-list",
                    value: [
                        { id: "c0113c14-144e-475c-9647-a65f9177665d", title: "テスト選択肢 1" },
                        { id: "6d86797a-d88a-4fc2-b4f6-1895afdc503e", title: "テスト選択肢 2" },
                        { id: "791bc06c-c4d5-4c74-b950-8596c04dbb0d", title: "テスト選択肢 3" }
                    ] },
                title: "テスト投票名"
            },
            activityFeed: {
                icon: "fad fa-poll-h",
                getMessage: (eventData) => {
                    return `チャンネル投票 **${eventData.title}** が開始されました`;
                }
            }
        },
        {
            id: "channel-poll-progress",
            name: "チャンネル投票進行",
            description: "あなたのチャンネルの投票が進行したとき。",
            cached: false,
            manualMetadata: {
                choices: {
                    type: "poll-choice-list",
                    value: [
                        { id: "c0113c14-144e-475c-9647-a65f9177665d", title: "テスト選択肢 1", totalVotes: 120, channelPointsVotes: 60 },
                        { id: "6d86797a-d88a-4fc2-b4f6-1895afdc503e", title: "テスト選択肢 2", totalVotes: 140, channelPointsVotes: 40 },
                        { id: "791bc06c-c4d5-4c74-b950-8596c04dbb0d", title: "テスト選択肢 3", totalVotes: 80, channelPointsVotes: 70 }
                    ] },
                title: "テスト投票名",
                winningChoiceName: "テスト選択肢 2",
                winningChoiceVotes: 140
            },
            activityFeed: {
                icon: "fad fa-poll-h",
                getMessage: (eventData) => {
                    return `チャンネル投票 **${eventData.title}** が進行しました`;
                }
            }
        },
        {
            id: "channel-poll-end",
            name: "チャンネル投票終了",
            description: "あなたのチャンネルの投票が終了したとき。",
            cached: false,
            manualMetadata: {
                choices: {
                    type: "poll-choice-list",
                    value: [
                        { id: "c0113c14-144e-475c-9647-a65f9177665d", title: "テスト選択肢 1", totalVotes: 125, channelPointsVotes: 62 },
                        { id: "6d86797a-d88a-4fc2-b4f6-1895afdc503e", title: "テスト選択肢 2", totalVotes: 145, channelPointsVotes: 42 },
                        { id: "791bc06c-c4d5-4c74-b950-8596c04dbb0d", title: "テスト選択肢 3", totalVotes: 85, channelPointsVotes: 72 }
                    ] },
                title: "テスト投票名",
                winningChoiceName: "テスト選択肢 2",
                winningChoiceVotes: 145
            },
            activityFeed: {
                icon: "fad fa-poll-h",
                getMessage: (eventData) => {
                    return `チャンネル投票 **${eventData.title}** が終了。勝利選択肢: **${eventData.winningChoiceName}**（**${eventData.winningChoiceVotes}** 票）`;
                }
            }
        },
        {
            id: "channel-goal-begin",
            name: "チャンネル目標開始",
            description: "あなたのチャンネルで目標が開始されたとき。",
            cached: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message: string;
                    if (eventData.description) {
                        message = `Channel ${eventData.type} goal **${eventData.description}** has begun (**${eventData.currentAmount}**/**${eventData.targetAmount}**)`;
                    } else {
                        message = `Channel ${eventData.type} goal has begun (**${eventData.currentAmount}**/**${eventData.targetAmount}**)`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-goal-progress",
            name: "チャンネル目標進行",
            description: "あなたのチャンネルの目標が進行したとき。",
            cached: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message: string;
                    if (eventData.description) {
                        message = `Channel ${eventData.type} goal **${eventData.description}** has progressed (**${eventData.currentAmount}**/**${eventData.targetAmount}**)`;
                    } else {
                        message = `Channel ${eventData.type} goal has progressed (**${eventData.currentAmount}**/**${eventData.targetAmount}**)`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-goal-end",
            name: "チャンネル目標終了",
            description: "あなたのチャンネルの目標が終了したとき。",
            cached: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message: string;
                    if (eventData.description) {
                        message = `Channel ${eventData.type} goal **${eventData.description}** has ended. Goal **${
                            eventData.isAchieved ? "was" : "was not"
                        }** achieved. (**${eventData.currentAmount}**/**${eventData.targetAmount}**)`;
                    } else {
                        message = `Channel ${eventData.type} goal has ended. Goal **${
                            eventData.isAchieved ? "was" : "was not"
                        }** achieved. (**${eventData.currentAmount}**/**${eventData.targetAmount}**)`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-prediction-begin",
            name: "チャンネル予想開始",
            description: "あなたのチャンネルで予想が開始されたとき。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** が開始されました`;
                }
            }
        },
        {
            id: "channel-prediction-progress",
            name: "チャンネル予想進行",
            description: "あなたのチャンネルの予想が進行したとき。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** が進行しました`;
                }
            }
        },
        {
            id: "channel-prediction-lock",
            name: "チャンネル予想ロック",
            description: "あなたのチャンネルの予想がロックされたとき。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** がロックされました`;
                }
            }
        },
        {
            id: "channel-prediction-end",
            name: "チャンネル予想終了",
            description: "あなたのチャンネルの予想が終了したとき。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** が終了。勝利結果: **${eventData.winningOutcome.title}**`;
                }
            }
        },
        {
            id: "hype-train-start",
            name: "ハイプトレイン開始",
            description: "あなたのチャンネルでハイプトレインが開始されたとき。",
            cached: false,
            manualMetadata: {
                total: "150",
                progress: "150",
                goal: "500",
                level: "1",
                isGoldenKappaTrain: false,
                isTreasureTrain: false,
                isSharedTrain: false
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: () => {
                    return "ハイプトレインが開始しました！";
                }
            }
        },
        {
            id: "hype-train-progress",
            name: "ハイプトレイン進行",
            description: "あなたのチャンネルのハイプトレインが進行したとき。",
            cached: false,
            manualMetadata: {
                total: "150",
                progress: "150",
                goal: "500",
                level: "1",
                isGoldenKappaTrain: false,
                isTreasureTrain: false,
                isSharedTrain: false
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: (eventData) => {
                    return `Level **${eventData.level}** hype train currently at **${Math.floor(
                        (eventData.progress / eventData.goal) * 100
                    )}%**`;
                }
            }
        },
        {
            id: "hype-train-level-up",
            name: "ハイプトレインレベルアップ",
            description: "あなたのチャンネルのハイプトレインが次のレベルへ進んだとき。",
            cached: false,
            manualMetadata: {
                previousLevel: "1",
                level: "2"
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: (eventData) => {
                    return `ハイプトレイン レベル **${eventData.level}** が解除されました！`;
                }
            }
        },
        {
            id: "hype-train-end",
            name: "ハイプトレイン終了",
            description: "あなたのチャンネルのハイプトレインが終了したとき。",
            cached: false,
            manualMetadata: {
                total: "150",
                level: "1",
                isGoldenKappaTrain: false,
                isTreasureTrain: false,
                isSharedTrain: false
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: (eventData) => {
                    return `レベル **${eventData.level}** のハイプトレインが終了しました`;
                }
            }
        },
        {
            id: "stream-online",
            name: "配信開始",
            description: "あなたの配信が開始されたとき。",
            cached: false,
            manualMetadata: {},
            activityFeed: {
                icon: "fad fa-play-circle",
                getMessage: () => {
                    return "配信が開始されました";
                }
            }
        },
        {
            id: "stream-offline",
            name: "配信終了",
            description: "あなたの配信が終了したとき。",
            cached: false,
            manualMetadata: {},
            activityFeed: {
                icon: "fad fa-stop-circle",
                getMessage: () => {
                    return "配信が終了しました";
                }
            }
        },
        {
            id: "charity-campaign-start",
            name: "チャリティキャンペーン開始",
            description: "あなたがチャンネルでチャリティキャンペーンを開始したとき。",
            cached: false,
            manualMetadata: {
                charityName: "Great Cause, LLC",
                charityDescription: "They do really great stuff",
                charityWebsite: "https://somewebsite.org",
                charityLogo: "https://somewebsite.org/logo.png",
                currentTotalAmount: "10",
                currentTotalCurrency: "USD",
                targetTotalAmount: "1000",
                targetTotalCurrency: "USD"
            },
            activityFeed: {
                icon: "fad fa-ribbon",
                getMessage: (eventData) => {
                    return `**${eventData.charityName}** を支援するチャリティキャンペーンが開始されました`;
                }
            }
        },
        {
            id: "charity-donation",
            name: "チャリティ寄付",
            description: "誰かがあなたのチャンネルのチャリティキャンペーンへ寄付したとき。",
            cached: false,
            manualMetadata: {
                from: "Firebot",
                charityName: "Great Cause, LLC",
                charityDescription: "They do really great stuff",
                charityWebsite: "https://somewebsite.org",
                charityLogo: "https://somewebsite.org/logo.png",
                donationAmount: "10",
                donationCurrency: "USD"
            },
            activityFeed: {
                icon: "fad fa-hand-holding-heart",
                getMessage: (eventData) => {
                    return `**${eventData.from}** が **${eventData.donationAmount} ${eventData.donationCurrency}** をチャリティ寄付しました`;
                }
            }
        },
        {
            id: "charity-campaign-progress",
            name: "チャリティキャンペーン進行",
            description: "あなたのチャンネルのチャリティキャンペーンが進行したとき。",
            cached: false,
            manualMetadata: {
                charityName: "Great Cause, LLC",
                charityDescription: "They do really great stuff",
                charityWebsite: "https://somewebsite.org",
                charityLogo: "https://somewebsite.org/logo.png",
                currentTotalAmount: "10",
                currentTotalCurrency: "USD",
                targetTotalAmount: "1000",
                targetTotalCurrency: "USD"
            },
            activityFeed: {
                icon: "fad fa-ribbon",
                getMessage: (eventData) => {
                    return `チャリティキャンペーンが進行中。現在合計: **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**`;
                }
            }
        },
        {
            id: "charity-campaign-end",
            name: "チャリティキャンペーン終了",
            description: "あなたのチャンネルのチャリティキャンペーンが終了したとき。",
            cached: false,
            manualMetadata: {
                charityName: "Great Cause, LLC",
                charityDescription: "They do really great stuff",
                charityWebsite: "https://somewebsite.org",
                charityLogo: "https://somewebsite.org/logo.png",
                currentTotalAmount: "10",
                currentTotalCurrency: "USD",
                targetTotalAmount: "1000",
                targetTotalCurrency: "USD"
            },
            activityFeed: {
                icon: "fad fa-ribbon",
                getMessage: (eventData) => {
                    return `チャリティキャンペーンが終了。目標達成: **${
                        eventData.goalReached ? "はい" : "いいえ"
                    }**。総額: **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**`;
                }
            }
        },
        {
            id: "shared-chat-started",
            name: "共有チャットセッション開始",
            description: "他チャンネルとの共有チャットセッションが開始されたとき。",
            cached: false
        },
        {
            id: "shared-chat-updated",
            name: "共有チャットセッション更新",
            description: "共有チャットセッションの参加者が更新されたとき。",
            cached: false
        },
        {
            id: "shared-chat-ended",
            name: "共有チャットセッション終了",
            description: "共有チャットセッションが終了したとき。",
            cached: false
        },
        {
            id: "shoutout-sent",
            name: "シャウトアウト送信",
            description: "あなたまたはモデレーターが他チャンネルへ Twitch シャウトアウトを送信したとき。",
            cached: false,
            manualMetadata: {
                moderator: "Firebot",
                username: "zunderscore",
                userDisplayName: "zunderscore",
                userId: "",
                viewerCount: 10
            },
            activityFeed: {
                icon: "fad fa-bullhorn",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.moderator}** が **${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** へシャウトアウトを送信`;
                }
            }
        },
        {
            id: "shoutout-received",
            name: "シャウトアウト受信",
            description: "他チャンネルから Twitch シャウトアウトを受信したとき。",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                viewerCount: 10
            },
            activityFeed: {
                icon: "fad fa-bullhorn",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** があなたのチャンネルを ${eventData.viewerCount} 人の視聴者にシャウトアウトしました`;
                }
            }
        },
        {
            id: "category-changed",
            name: "カテゴリ変更",
            description: "あなたが Twitch 配信カテゴリを変更したとき。",
            cached: false,
            manualMetadata: {
                category: "Just Chatting"
            },
            activityFeed: {
                icon: "fad fa-th-large",
                getMessage: (eventData) => {
                    return `Twitch 配信カテゴリが **${eventData.category}** に変更されました`;
                }
            }
        },
        {
            id: "title-changed",
            name: "タイトル変更",
            description: "あなたが Twitch 配信タイトルを変更したとき。",
            cached: false,
            manualMetadata: {
                title: "Stream Title"
            },
            activityFeed: {
                icon: "fad fa-text",
                getMessage: (eventData) => {
                    return `Twitch 配信タイトルが **${eventData.title}** に変更されました`;
                }
            }
        },
        {
            id: "ad-break-upcoming",
            name: "予定広告ブレイク開始間近",
            description: "チャンネルで予定された広告ブレイクがまもなく開始されるとき。",
            cached: false,
            manualMetadata: {
                adBreakDuration: 60,
                secondsUntilNextAdBreak: 300
            },
            activityFeed: {
                icon: "fad fa-ad",
                getMessage: (eventData) => {
                    const mins = Math.floor(eventData.adBreakDuration / 60);
                    const remainingSecs = eventData.adBreakDuration % 60;

                    const friendlyDuration =
                        mins > 0
                            ? `${mins}m${remainingSecs > 0 ? ` ${remainingSecs}s` : ""}`
                            : `${eventData.adBreakDuration}s`;

                    const minutesUntilNextAdBreak = Math.round(eventData.secondsUntilNextAdBreak / 60);

                    return `**${friendlyDuration}** の予定広告ブレイクが約 **${minutesUntilNextAdBreak}** 分後に開始します`;
                }
            }
        },
        {
            id: "ad-break-start",
            name: "広告ブレイク開始",
            description: "チャンネルで広告ブレイクが開始されたとき。",
            cached: false,
            manualMetadata: {
                adBreakDuration: 60,
                isAdBreakScheduled: true
            },
            activityFeed: {
                icon: "fad fa-ad",
                getMessage: (eventData) => {
                    const mins = Math.floor(eventData.adBreakDuration / 60);
                    const remainingSecs = eventData.adBreakDuration % 60;

                    const friendlyDuration =
                        mins > 0
                            ? `${mins}m${remainingSecs > 0 ? ` ${remainingSecs}s` : ""}`
                            : `${eventData.adBreakDuration}s`;

                    return `**${friendlyDuration}** の**${
                        eventData.isAdBreakScheduled ? "予定" : "手動"
                    }**広告ブレイクが開始されました`;
                }
            }
        },
        {
            id: "ad-break-end",
            name: "広告ブレイク終了",
            description: "チャンネルで広告ブレイクが終了したとき。",
            cached: false,
            manualMetadata: {
                adBreakDuration: 60,
                isAdBreakScheduled: true
            },
            activityFeed: {
                icon: "fad fa-ad",
                getMessage: (eventData) => {
                    const mins = Math.floor(eventData.adBreakDuration / 60);
                    const remainingSecs = eventData.adBreakDuration % 60;

                    const friendlyDuration =
                        mins > 0
                            ? `${mins}m${remainingSecs > 0 ? ` ${remainingSecs}s` : ""}`
                            : `${eventData.adBreakDuration}s`;

                    return `**${friendlyDuration}** の**${
                        eventData.isAdBreakScheduled ? "予定" : "手動"
                    }**広告ブレイクが終了しました`;
                }
            }
        }
    ]
};