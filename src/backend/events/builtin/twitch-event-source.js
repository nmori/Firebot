"use strict";

module.exports = {
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
                username: "Firebot",
                viewerCount: 5
            },
            activityFeed: {
                icon: "fad fa-siren-on",
                getMessage: (eventData) => {
                    return `**${eventData.username}** が **${eventData.viewerCount}** 人の視聴者とともにレイドしました`;
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
                username: "Firebot"
            },
            activityFeed: {
                icon: "fas fa-heart",
                getMessage: (eventData) => {
                    return `**${eventData.username}** がフォローしました`;
                }
            }
        },
        {
            id: "sub",
            name: "サブスクライブ時",
            description: "誰かがあなたのチャンネルをサブスク（または再サブスク）したとき。",
            cached: false,
            manualMetadata: {
                username: "Firebot",
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
                    return `**${eventData.username}** が ${eventData.isResub ? '再サブスク' : 'サブスク'} しました。 **${eventData.totalMonths} ヶ月目** 、${eventData.subPlan === 'Prime' ?
                        "**Twitch Prime**" : "**Tier " + eventData.subPlan.replace("000", "") + "**"} `;
                }
            }
        },
        {
            id: "prime-sub-upgraded",
            name: "プライム・サブスクのアップグレード時",
            description: "プライム会員からサブスクにアップグレードした場合",
            cached: false,
            manualMetadata: {
                username: "Firebot",
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
                    return `**${eventData.username}** が **Tier ${eventData.subPlan.replace("000", "")}** にアップグレードしました `;
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
                giftSubMonths: 5,
                giftDuration: 1,
                gifteeUsername: "MageEnclave"
            },
            activityFeed: {
                icon: "fad fa-gift",
                getMessage: (eventData) => {
                    return `**${eventData.isAnonymous ? "匿名" : eventData.gifterUsername}** さんが ${eventData.giftDuration > 1 ? ` **${eventData.giftDuration} ヶ月の** ` : ''} **Tier ${eventData.subPlan.replace("000", "")}** のサブスクを **${eventData.gifteeUsername}** へ贈りました。( ${eventData.giftSubMonths} ヶ月 )`;
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
                        { gifteeUsername: "User1", giftSubMonths: 3 },
                        { gifteeUsername: "User2", giftSubMonths: 5 },
                        { gifteeUsername: "User3", giftSubMonths: 8 },
                        { gifteeUsername: "User4", giftSubMonths: 10 },
                        { gifteeUsername: "User5", giftSubMonths: 16 }
                    ]
                }
            },
            activityFeed: {
                icon: "fad fa-gifts",
                getMessage: (eventData) => {
                    return `**${eventData.isAnonymous ? "匿名" : eventData.gifterUsername}** さんは **${eventData.subCount} つの Tier ${eventData.subPlan.replace("000", "")}** ギフトを贈りました`;
                }
            }
        },
        {
            id: "gift-sub-upgraded",
            name: "サブスクギフトのアップグレード時",
            description: "サブスクギフトからサブスクにアップグレードされた場合",
            cached: false,
            manualMetadata: {
                username: "CaveMobster",
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
                    return `**${eventData.username}** さんは サブスクギフトから **Tier ${eventData.subPlan.replace("000", "")}**へアップグレードしました`;
                }
            }
        },
        {
            id: "cheer",
            name: "Cheer",
            description: "誰かがあなたのチャンネルで声援を送ったとき（ビッツを使ったとき）",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                isAnonymous: false,
                bits: 100,
                totalBits: 1200,
                cheerMessage: "cheer100 テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    return `**${eventData.username}** から **${eventData.bits}** ビッツの声援が届きました。 （トータル：**${eventData.totalBits}** ビッツ、**${eventData.username}** より）`;
                }
            }
        },
        {
            id: "bits-badge-unlocked",
            name: "ビッツバッジの実績解除",
            description: "誰かがあなたのチャンネルで新しいビッツバッジのロックを解除したとき",
            cached: false,
            manualMetadata: {
                username: "Firebot",
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
                    return `**${eventData.username}** さんが **${eventData.badgeTier}** ビッツバッチを実績解除しました`;
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
                username: "Firebot"
            },
            activityFeed: {
                icon: "fad fa-house-return",
                getMessage: (eventData) => {
                    return `**${eventData.username}** さんが来ました`;
                }
            }
        },
        {
            id: "chat-message",
            name: "チャット時",
            description: "チャットが来た時",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot",
                messageText: "テストメッセージ"
            }
        },
        {
            id: "announcement",
            name: "アナウンス",
            description: "アナウンスを送信した時",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot",
                messageText: "テストアナウンス"
            }
        },
        {
            id: "banned",
            name: "視聴者追放時",
            description: "視聴者を追放した時",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "CaveMobster",
                moderator: "Firebot",
                modReason: "They were extra naughty"
            },
            activityFeed: {
                icon: "fad fa-gavel",
                getMessage: (eventData) => {
                    let message;
                    if (eventData.modReason) {
                        message = `**${eventData.username}** が **${eventData.moderator}**によって追放された。 理由は **${eventData.modReason}**`;
                    } else {
                        message = `**${eventData.username}** が **${eventData.moderator}** によって追放された。`;
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
            queued: false,
            manualMetadata: {
                username: "CaveMobster",
                moderator: "Firebot"
            },
            activityFeed: {
                icon: "fad fa-gavel",
                getMessage: (eventData) => {
                    return `**${eventData.username}** は **${eventData.moderator}** によって追放解除されました`;
                }
            }
        },
        {
            id: "timeout",
            name: "視聴者タイムアウト時",
            description: "あなたのチャンネルで誰かがタイムアウト指示されたとき",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "ebiggz",
                timeoutDuration: "1",
                moderator: "Firebot",
                modReason: "They were naughty"
            },
            activityFeed: {
                icon: "fad fa-stopwatch",
                getMessage: (eventData) => {
                    return `**${eventData.username}** は  ${eventData.moderator}によって**${eventData.timeoutDuration} ** 秒タイムアウトされました。 理由は **${eventData.modReason}**`;
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
            queued: false,
            manualMetadata: {
                username: "Firebot",
                rewardName: "テスト特典",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: "200",
                messageText: "テストメッセージ"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    return `**${eventData.username}** さんが「**${eventData.rewardName}**」を交換しました。${eventData.messageText && !!eventData.messageText.length ? `: *${eventData.messageText}*` : ''}`;
                }
            }
        },
        {
            id: "whisper",
            name: "ささやく",
            description: "誰かがあなたにささやいたとき",
            cached: true,
            manualMetadata: {
                username: "Firebot",
                message: "ささやきテスト"
            },
            activityFeed: {
                icon: "fad fa-comment-alt",
                getMessage: (eventData) => {
                    return `**${eventData.username}** さんが、ささやきました: ${eventData.message}`;
                }
            }
        },
        {
            id: "chat-mode-changed",
            name: "チャットモード変更時",
            description: "モデレータによってチャットモードの設定が更新された場合",
            cached: false,
            queued: false,
            manualMetadata: {
                chatMode: {
                    type: "enum",
                    options: {
                        "emoteonly": "エモートのみ",
                        "subscribers": "サブスク登録者のみ",
                        "followers": "フォロワーのみ",
                        "slow": "スローモード",
                        "r9kbeta": "ユニークチャットのみ"
                    },
                    value: "emoteonly"
                },
                chatModeState: {
                    type: "enum",
                    options: {
                        "enabled": "有効",
                        "disabled": "無効"
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
            queued: false,
            manualMetadata: {
                title: "投票名"
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
            queued: false,
            manualMetadata: {
                title: "投票名"
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
            queued: false,
            manualMetadata: {
                title: "投票名"
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
            queued: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message;
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
            queued: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message;
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
            queued: false,
            manualMetadata: {
                description: "目標名"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message;
                    if (eventData.description) {
                        message = `チャンネル目標 ${eventData.type} （**${eventData.description}**）が終了しました 目標は達成 **${eventData.isAchieved ? "しました" : "しませんでした"}**. (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `チャンネル目標 ${eventData.type} が終了しました. 目標は達成 **${eventData.isAchieved ? "しました" : "しませんでした"}**. (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
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
            queued: false,
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
            queued: false,
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
            queued: false,
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
            queued: false,
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
            queued: false,
            manualMetadata: {
                total: "150",
                progress: "150",
                goal: "500",
                level: "1"
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
            queued: false,
            manualMetadata: {
                total: "150",
                progress: "150",
                goal: "500",
                level: "1"
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: (eventData) => {
                    return `ハイプトレイン Lv **${eventData.level}** が進行中: **${Math.floor((eventData.progress / eventData.goal) * 100)}%**.`;
                }
            }
        },
        {
            id: "hype-train-end",
            name: "ハイプトレイン終了時",
            description: "あなたのチャンネルのハイプトレインが終わるとき。",
            cached: false,
            queued: false,
            manualMetadata: {
                total: "150",
                level: "1"
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
            queued: false,
            manualMetadata: { },
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
            queued: false,
            manualMetadata: { },
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
            queued: false,
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
            queued: false,
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
            queued: false,
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
            queued: false,
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
                    return `チャリティーキャンペーン終了。目標は達成**${eventData.goalReached ? "しました" : "しませんでした"}**. 総額: **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**.`;
                }
            }
        },
        {
            id: "shoutout-sent",
            name: "Twitchシャウトアウト送信時",
            description: "あなたや、モデレーターが他のチャンネルにTwitchシャウトアウトを送信した場合。",
            cached: false,
            queued: false,
            manualMetadata: {
                moderator: "Firebot",
                username: "zunderscore",
                viewerCount: 10
            },
            activityFeed: {
                icon: "fad fa-bullhorn",
                getMessage: (eventData) => {
                    return `**${eventData.moderator}** は **${eventData.username}** をシャウトアウトしました`;
                }
            }
        },
        {
            id: "shoutout-received",
            name: "シャウトを受信した時",
            description: "他のチャンネルがあなたにTwitchのシャウトを送ってきたとき",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot",
                viewerCount: 10
            },
            activityFeed: {
                icon: "fad fa-bullhorn",
                getMessage: (eventData) => {
                    return `**${eventData.username}** は、あなたの事を ${eventData.viewerCount} 人に紹介しました。 `;
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
        }
    ]
};