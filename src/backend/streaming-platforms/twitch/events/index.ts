/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
    description: "Twitchのフォロー、サブスクなどのイベント",
    events: [
        {
            id: "raid",
            name: "レイド時",
            description: "誰かがあなたのチャンネルにレイドしたとき",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **${eventData.viewerCount}** 人の視聴者とともにレイドしました`;
                }
            }
        },
        {
            id: "outgoing-raid-started",
            name: "Outgoing Raid Started",
            description: "When you or a moderator starts an outgoing raid to another channel.",
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
                    return `**${eventData.moderator}** started raid to user **${eventData.raidTargetUserDisplayName}** with **${
                        eventData.viewerCount
                    }** viewer(s)`;
                }
            }
        },
        {
            id: "outgoing-raid-canceled",
            name: "Outgoing Raid Canceled",
            description: "When you or a moderator cancels an outgoing raid to another channel.",
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
                    return `**${eventData.moderator}** canceled raid to user **${eventData.raidTargetUserDisplayName}**`;
                }
            }
        },
        {
            id: "raid-sent-off",
            name: "レイド送信時",
            description: "レイド送信完了したとき",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **${eventData.raidTargetUserDisplayName}** に **${eventData.viewerCount
                        }** 人の視聴者とともにレイドしました`;
                }
            }
        },
        {
            id: "follow",
            name: "フォロー時",
            description: "誰かがあなたのチャンネルをフォローしたとき",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** がフォローしました`;
                }
            }
        },
        {
            id: "sub",
            name: "サブスクライブ時",
            description: "誰かがあなたのチャンネルをサブスク（または再サブスク）したとき。",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""}** が ${eventData.isResub ? "再サブスク" : "サブスク"
                        } しました： **${eventData.totalMonths} ヵ月目** ${eventData.subPlan === "Prime"
                            ? "**Twitch Prime**で"
                            : `**Tier ${eventData.subPlan.replace("000", "")}**で`
                        }`;
                }
            }
        },
        {
            id: "prime-sub-upgraded",
            name: "プライム・サブスクのアップグレード時",
            description: "プライム会員からサブスクにアップグレードした場合",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **Tier ${eventData.subPlan.replace("000", "")}にアップグレードしました!**`;
                }
            }
        },
        {
            id: "subs-gifted",
            name: "サブスクギフト時",
            description: "誰かがあなたのチャンネルで誰かにサブスクギフトを送ったとき",
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
                    return `**${eventData.isAnonymous ? "匿名のギフター" : eventData.gifterUsername}** が${
                        eventData.giftDuration > 1 ? ` **${eventData.giftDuration}  ヵ月** の` : ""
                    } **Tier ${eventData.subPlan.replace("000", "")}** サブスクを **${
                        eventData.gifteeUsername
                    }**にギフトしました`;
                }
            }
        },
        {
            id: "community-subs-gifted",
            name: "コミュニティへのサブスクギフト時",
            description: "誰かがコミュニティーにサブスクギフトを贈ったとき",
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
                    return `**${eventData.isAnonymous ? "匿名ギフター" : eventData.gifterUsername}** が **${eventData.subCount
                        } 個の Tier ${eventData.subPlan.replace("000", "")}** サブスクをコミュニティにギフトしました`;
                }
            }
        },
        {
            id: "gift-sub-upgraded",
            name: "サブスクギフトのアップグレード時",
            description: "サブスクギフトからサブスクにアップグレードされた場合",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** がギフトサブスクを **Tier ${eventData.subPlan.replace("000", "")}** にアップグレードしました！`;
                }
            }
        },
        {
            id: "cheer",
            name: "Cheer",
            description: "誰かがあなたのチャンネルで声援を送ったとき（ビッツを使ったとき）",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **${eventData.bits}** ビッツを応援しました。チャンネルでの合計応援ビッツは **${eventData.totalBits
                        }** です。`;
                }
            }
        },
        {
            id: "bits-badge-unlocked",
            name: "ビッツバッジ解除時",
            description: "誰かがあなたのチャンネルで新しいビッツバッジのロックを解除したとき",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                message: "Test message",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** があなたのチャンネルで **${eventData.badgeTier}** ビッツバッジを解除しました！`;
                }
            }
        },
        {
            id: "bits-powerup-message-effect",
            name: "Power-Up: Message Effects",
            description: "When a viewer uses the \"Message Effects\" Power-Up in your channel.",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                bits: 30,
                totalBits: 1200,
                cheerMessage: "Test Message"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                    }** used a Message Effects Power-Up for **${eventData.bits}** bits.`;
                }
            }
        },
        {
            id: "bits-powerup-celebration",
            name: "Power-up: On-Screen Celebration",
            description: "When a viewer uses the \"On-Screen Celebration\" Power-Up in your channel.",
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
                    }** used a Celebration Power-Up for **${eventData.bits}** bits.`;
                }
            }
        },
        {
            id: "bits-powerup-gigantified-emote",
            name: "Power-up: Gigantify an Emote",
            description: "When a viewer uses the \"Gigantify an Emote\" Power-Up in your channel.",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                bits: 20,
                totalBits: 1200,
                cheerMessage: "Test Message",
                emoteName: "PogChamp",
                emoteUrl: "https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/3.0"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                    }** gigantified the **${eventData.emoteName}** emote for **${eventData.bits}** bits.`;
                }
            }
        },
        {
            id: "viewer-arrived",
            name: "視聴者が来た時",
            description: "視聴者が配信で最初にチャットをするとき",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が到着しました`;
                }
            }
        },
        {
            id: "chat-cleared",
            name: "チャットを消したとき",
            description: "あなたのチャンネルでチャットがクリアされた場合",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userId: ""
            }
        },
        {
            id: "chat-message",
            name: "チャット時",
            description: "チャットが来た時",
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
            description: "自分のチャンネルでチャットメッセージが削除された場合",
            cached: false,
            manualMetadata: {
                username: "firebot",
                messageText: "テストメッセージ"
            }
        },
        {
            id: "first-time-chat",
            name: "初回チャット",
            description: "あなたのチャンネルに初めてチャットがあったとき",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が初めてあなたのチャンネルでチャットしました`;
                }
            }
        },
        {
            id: "announcement",
            name: "アナウンス",
            description: "アナウンスを送信した時",
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
            name: "視聴者追放時",
            description: "視聴者を追放した時",
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
                    let message = `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **${eventData.moderator}** によって追放されました。`;

                    if (eventData.modReason) {
                        message = `${message} 理由: **${eventData.modReason}**`;
                    }
                    return message;
                }
            }
        },
        {
            id: "unbanned",
            name: "視聴者の追放解除時",
            description: "視聴者を追放を解除した時",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** の追放が **${eventData.moderator}** によって解除されました。`;
                }
            }
        },
        {
            id: "timeout",
            name: "視聴者タイムアウト時",
            description: "あなたのチャンネルで誰かがタイムアウト指示されたとき",
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
                    let message = `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **${eventData.timeoutDuration} 秒間** ${eventData.moderator} によってタイムアウトされました。`;

                    if (eventData.modReason) {
                        message = `${message} 理由: **${eventData.modReason}**`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption",
            name: "チャンネル特典交換時",
            description: "誰かがチャンネル特典を利用した場合",
            cached: true,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "テスト特典",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: "200",
                messageText: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** が **${eventData.rewardName}** を交換しました${eventData.messageText && !!eventData.messageText.length ? `: *${eventData.messageText}*` : ""
                        }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-fulfilled",
            name: "チャンネル特典の交換が承認されたとき",
            description: "カスタムチャネルのリワード交換が完了/承認された場合",
            cached: false,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "Test Reward",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: 200,
                messageText: "Test message"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** の **${eventData.rewardName}** 交換が承認されました。${eventData.messageText && !!eventData.messageText.length ? `*${eventData.messageText}*` : ""
                        }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-canceled",
            name: "チャンネル特典の交換が拒否されたとき",
            description: "チャネルの特典交換が拒否/返金された場合",
            cached: false,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "Test Reward",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: 200,
                messageText: "Test message"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** の **${eventData.rewardName}** 交換が拒否されました。${eventData.messageText && !!eventData.messageText.length ? `*${eventData.messageText}*` : ""
                        }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-single-message-bypass-sub-mode",
            name: "Channel Reward Redemption: Send a Message in Sub-Only Mode",
            description: "When someone redeems \"Send a Message in Sub-Only Mode\" to post a message in your channel",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                messageText: "Test message",
                rewardDescription: "Send a Message in Sub-Only Mode"
            },
            activityFeed: {
                icon: "fad fa-arrow-right",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** redeemed **Send a Message in Sub-Only Mode**.`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-send-highlighted-message",
            name: "Channel Reward Redemption: Highlight My Message",
            description: "When someone redeems \"Highlight My Message\" in your channel",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardCost: 200,
                messageText: "Test message",
                rewardDescription: "Highlight My Message"
            },
            activityFeed: {
                icon: "fad fa-highlighter",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    const message = `**${eventData.userDisplayName}${
                        showUserIdName ? ` (${eventData.username})` : ""
                    }** redeemed **Highlight My Message**.`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-random-sub-emote-unlock",
            name: "Channel Reward Redemption: Unlock a Random Sub Emote",
            description: "When someone redeems \"Unlock a Random Sub Emote\" to unlock an emote in your channel",
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
                    }** redeemed **Unlock a Random Sub Emote**.`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-chosen-sub-emote-unlock",
            name: "Channel Reward Redemption: Choose an Emote to Unlock",
            description: "When someone redeems \"Choose an Emote to Unlock\" to unlock an emote in your channel",
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
                    }** redeemed **Choose an Emote to Unlock**.`;
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption-chosen-modified-sub-emote-unlock",
            name: "Channel Reward Redemption: Modify a Single Emote",
            description: "When someone redeems \"Modify a Single Emote\" to modify and unlock an emote in your channel",
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
                    }** redeemed **Modify a Single Emote**.`;
                    return message;
                }
            }
        },
        {
            id: "whisper",
            name: "ささやく",
            description: "誰かがあなたにささやいたとき",
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                message: "ささやきテスト",
                sentTo: {
                    type: "enum",
                    options: {
                        streamer: "Streamer",
                        bot: "Bot"
                    },
                    value: "streamer"
                }
            },
            activityFeed: {
                icon: "fad fa-comment-alt",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** があなたの **${eventData.sentTo}** アカウントに以下のささやきを送りました: ${eventData.message}`;
                }
            }
        },
        {
            id: "chat-mode-changed",
            name: "チャットモード変更時",
            description: "モデレータによってチャットモードの設定が更新された場合",
            cached: false,
            manualMetadata: {
                chatMode: {
                    type: "enum",
                    options: {
                        "emoteonly": "エモートのみ",
                        "subscribers": "サブスク登録者のみ",
                        "followers": "フォロワーのみ",
                        "slow": "スローモード",
                        "unique": "ユニークチャットのみ"
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
                    return `**${eventData.moderator}** は**${eventData.chatMode}**を**${eventData.chatModeState}**にしました`;
                }
            }
        },
        {
            id: "channel-poll-begin",
            name: "チャンネル投票開始時",
            description: "自分のチャンネルでチャンネル投票が始まったら",
            cached: false,
            manualMetadata: {
                choices: {
                    options: { hideVotes: true },
                    type: "poll-choice-list",
                    value: [
                        { id: "c0113c14-144e-475c-9647-a65f9177665d", title: "Test Choice 1" },
                        { id: "6d86797a-d88a-4fc2-b4f6-1895afdc503e", title: "Test Choice 2" },
                        { id: "791bc06c-c4d5-4c74-b950-8596c04dbb0d", title: "Test Choice 3" }
                    ]
                },
                title: "Test Poll Name"
            },
            activityFeed: {
                icon: "fad fa-poll-h",
                getMessage: (eventData) => {
                    return `チャンネル投票 **${eventData.title}** が始まりました.`;
                }
            }
        },
        {
            id: "channel-poll-progress",
            name: "チャンネル投票に変化があった時",
            description: "あなたのチャンネルでチャンネル投票が行われたとき。",
            cached: false,
            manualMetadata: {
                choices: {
                    type: "poll-choice-list",
                    value: [
                        { id: "c0113c14-144e-475c-9647-a65f9177665d", title: "Test Choice 1", totalVotes: 120, channelPointsVotes: 60 },
                        { id: "6d86797a-d88a-4fc2-b4f6-1895afdc503e", title: "Test Choice 2", totalVotes: 140, channelPointsVotes: 40 },
                        { id: "791bc06c-c4d5-4c74-b950-8596c04dbb0d", title: "Test Choice 3", totalVotes: 80, channelPointsVotes: 70 }
                    ]
                },
                title: "Test Poll Name",
                winningChoiceName: "Test Choice 2",
                winningChoiceVotes: 140
            },
            activityFeed: {
                icon: "fad fa-poll-h",
                getMessage: (eventData) => {
                    return `チャンネル投票 **${eventData.title}** が行われました.`;
                }
            }
        },
        {
            id: "channel-poll-end",
            name: "チャンネル投票終了時",
            description: "チャンネルポールが終了したとき",
            cached: false,
            manualMetadata: {
                choices: {
                    type: "poll-choice-list",
                    value: [
                        { id: "c0113c14-144e-475c-9647-a65f9177665d", title: "Test Choice 1", totalVotes: 125, channelPointsVotes: 62 },
                        { id: "6d86797a-d88a-4fc2-b4f6-1895afdc503e", title: "Test Choice 2", totalVotes: 145, channelPointsVotes: 42 },
                        { id: "791bc06c-c4d5-4c74-b950-8596c04dbb0d", title: "Test Choice 3", totalVotes: 85, channelPointsVotes: 72 }
                    ]
                },
                title: "Test Poll Name",
                winningChoiceName: "Test Choice 2",
                winningChoiceVotes: 145
            },
            activityFeed: {
                icon: "fad fa-poll-h",
                getMessage: (eventData) => {
                    return `チャンネル投票 **${eventData.title}** は終了しました。優勝候補: **${eventData.winningChoiceName}** （**${eventData.winningChoiceVotes}** 票）`;
                }
            }
        },
        {
            id: "channel-goal-begin",
            name: "チャンネル目標開始時",
            description: "あなたのチャンネルでチャンネル目標が始まったら。",
            cached: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message: string;
                    if (eventData.description) {
                        message = `チャンネル目標 ${eventData.type} （**${eventData.description}**）が始まりました (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `チャンネル目標 ${eventData.type} が始まりました (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-goal-progress",
            name: "チャンネル目標に変化があった時",
            description: "あなたのチャンネルでチャンネル目標が進行したとき",
            cached: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message: string;
                    if (eventData.description) {
                        message = `チャンネル目標 ${eventData.type} （ **${eventData.description}** ）が進みました (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `チャンネル目標 ${eventData.type} が進みました(**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-goal-end",
            name: "チャンネル目標終了時",
            description: "チャンネル目標が終了した場合",
            cached: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message: string;
                    if (eventData.description) {
                        message = `チャンネル ${eventData.type} 目標 **${eventData.description}** が終了しました。目標は**${eventData.isAchieved ? "達成" : "未達成"
                            }**でした。(**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `チャンネル ${eventData.type} 目標が終了しました。目標は**${eventData.isAchieved ? "達成" : "未達成"
                            }**でした。(**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-prediction-begin",
            name: "チャンネル予想開始時",
            description: "自分のチャンネルでチャンネル予想が始まったら",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** が始まりました`;
                }
            }
        },
        {
            id: "channel-prediction-progress",
            name: "チャンネル予想の進捗状況時",
            description: "あなたのチャンネルでチャンネル予想が進行したとき。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** が進みました`;
                }
            }
        },
        {
            id: "channel-prediction-lock",
            name: "チャンネル予測ロック時",
            description: "自分のチャンネルのチャンネル予想がロックされた場合。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** はロックされました.`;
                }
            }
        },
        {
            id: "channel-prediction-end",
            name: "チャンネル予想終了時",
            description: "あなたのチャンネルでチャンネル予想が終了したとき。",
            cached: false,
            manualMetadata: {
                title: "タイトル"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `チャンネル予想 **${eventData.title}** を締め切りました. 勝利結果: **${eventData.winningOutcome.title}**.`;
                }
            }
        },
        {
            id: "hype-train-start",
            name: "ハイプトレイン始動時",
            description: "あなたのチャンネルでハイプトレインが始まったら。",
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
                    return `ハイプトレインが始まりました`;
                }
            }
        },
        {
            id: "hype-train-progress",
            name: "ハイプトレインに変化があった時",
            description: "あなたのチャンネルでハイプトレインが進行したとき",
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
                    return `レベル **${eventData.level}** のハイプトレインが現在 **${Math.floor(
                        (eventData.progress / eventData.goal) * 100
                    )}%** まで進行しています`;
                }
            }
        },
        {
            id: "hype-train-level-up",
            name: "Hype Train Level Up",
            description: "When a hype train on your channel advances to the next level.",
            cached: false,
            manualMetadata: {
                previousLevel: "1",
                level: "2"
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: (eventData) => {
                    return `Hype train level **${eventData.level}** unlocked!`;
                }
            }
        },
        {
            id: "hype-train-end",
            name: "ハイプトレイン終了時",
            description: "あなたのチャンネルのハイプトレインが終わるとき。",
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
                    return `ハイプトレイン Lv **${eventData.level}** が終了しました`;
                }
            }
        },
        {
            id: "stream-online",
            name: "配信開始時",
            description: "配信が始まるとき",
            cached: false,
            manualMetadata: {},
            activityFeed: {
                icon: "fad fa-play-circle",
                getMessage: () => {
                    return `配信が始まりました`;
                }
            }
        },
        {
            id: "stream-offline",
            name: "配信終了時",
            description: "配信が終了したとき",
            cached: false,
            manualMetadata: {},
            activityFeed: {
                icon: "fad fa-stop-circle",
                getMessage: () => {
                    return `配信終了しました`;
                }
            }
        },
        {
            id: "charity-campaign-start",
            name: "チャリティキャンペーン開始時",
            description: "あなたのチャンネルでチャリティーキャンペーンを始めたとき",
            cached: false,
            manualMetadata: {
                charityName: "Great Cause, LLC",
                charityDescription: "彼らは本当に素晴らしい仕事をしている",
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
                    return `チャリティ・キャンペーン **${eventData.charityName}** が始まりました.`;
                }
            }
        },
        {
            id: "charity-donation",
            name: "チャリティー寄付時",
            description: "誰かがあなたのチャンネルのチャリティ・キャンペーンに寄付したとき。",
            cached: false,
            manualMetadata: {
                from: "Firebot",
                charityName: "Great Cause, LLC",
                charityDescription: "彼らは本当に素晴らしい仕事をしている",
                charityWebsite: "https://somewebsite.org",
                charityLogo: "https://somewebsite.org/logo.png",
                donationAmount: "10",
                donationCurrency: "USD"
            },
            activityFeed: {
                icon: "fad fa-hand-holding-heart",
                getMessage: (eventData) => {
                    return `**${eventData.from}** は **${eventData.donationAmount} ${eventData.donationCurrency}** 寄付しました.`;
                }
            }
        },
        {
            id: "charity-campaign-progress",
            name: "チャリティ・キャンペーンの進捗に変化があった時",
            description: "あなたのチャンネルのチャリティ・キャンペーンが進行するとき。",
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
                    return `チャリティキャンペーン総額: **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**.`;
                }
            }
        },
        {
            id: "charity-campaign-end",
            name: "チャリティキャンペーン終了時",
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
                    return `チャリティキャンペーンが終了しました。目標達成: **${eventData.goalReached ? "はい" : "いいえ"
                        }**。総額: **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**。`;
                }
            }
        },
        {
            id: "shoutout-sent",
            name: "Twitchシャウトアウト送信時",
            description: "あなたや、モデレーターが他のチャンネルにTwitchシャウトアウトを送信した場合。",
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
                    return `**${eventData.moderator}** が **${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** にシャウトアウトを送りました`;
                }
            }
        },
        {
            id: "shoutout-received",
            name: "シャウトを受信した時",
            description: "他のチャンネルがあなたにTwitchのシャウトを送ってきたとき",
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
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** があなたのチャンネルを ${eventData.viewerCount} 人の視聴者にシャウトアウトしました`;
                }
            }
        },
        {
            id: "category-changed",
            name: "カテゴリー変更時",
            description: "Twitch配信カテゴリーを変更した場合。",
            cached: false,
            manualMetadata: {
                category: "Just Chatting"
            },
            activityFeed: {
                icon: "fad fa-th-large",
                getMessage: (eventData) => {
                    return `配信カテゴリーを **${eventData.category}** に変更しました`;
                }
            }
        },
        {
            id: "title-changed",
            name: "タイトル変更時",
            description: "Twitchストリームのタイトルを変更するとき。",
            cached: false,
            manualMetadata: {
                title: "Stream Title"
            },
            activityFeed: {
                icon: "fad fa-text",
                getMessage: (eventData) => {
                    return `配信タイトルを **${eventData.title}** に変更しました`;
                }
            }
        },
        {
            id: "ad-break-upcoming",
            name: "広告の開始予告を受け取ったとき",
            description: "広告の予約がきたとき",
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
                            ? `${mins}分${remainingSecs > 0 ? ` ${remainingSecs}秒` : ""}`
                            : `${eventData.adBreakDuration}秒`;

                    const minutesUntilNextAdBreak = Math.round(eventData.secondsUntilNextAdBreak / 60);

                    return `**${friendlyDuration}**の予約広告が約**${minutesUntilNextAdBreak}**分後に開始されます`;
                }
            }
        },
        {
            id: "ad-break-start",
            name: "広告が始まったとき",
            description: "広告が始まった",
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
                            ? `${mins}分${remainingSecs > 0 ? ` ${remainingSecs}秒` : ""}`
                            : `${eventData.adBreakDuration}秒`;

                    return `**${friendlyDuration}**の**${eventData.isAdBreakScheduled ? "予約" : "手動"
                        }**広告が開始されました`;
                }
            }
        },
        {
            id: "ad-break-end",
            name: "広告が終了したとき",
            description: "広告が終了したとき",
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
                            ? `${mins}分${remainingSecs > 0 ? ` ${remainingSecs}秒` : ""}`
                            : `${eventData.adBreakDuration}秒`;

                    return `**${friendlyDuration}**の**${eventData.isAdBreakScheduled ? "予約" : "手動"
                        }**広告が終了しました`;
                }
            }
        }
    ]
};