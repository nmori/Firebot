"use strict";

module.exports = {
    id: "twitch",
    name: "Twitch",
    description: "Twitch縺ｮ繝輔か繝ｭ繝ｼ縲√し繝悶せ繧ｯ縺ｪ縺ｩ縺ｮ繧､繝吶Φ繝・,
    events: [
        {
            id: "raid",
            name: "繝ｬ繧､繝画凾",
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｫ繝ｬ繧､繝峨＠縺溘→縺・,
            cached: true,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "Firebot",
                viewerCount: 5
            },
            activityFeed: {
                icon: "fad fa-siren-on",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺・**${eventData.viewerCount}** 莠ｺ縺ｮ隕冶・閠・→縺ｨ繧ゅ↓繝ｬ繧､繝峨＠縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "raid-sent-off",
            name: "繝ｬ繧､繝蛾∽ｿ｡譎・,
            description: "繝ｬ繧､繝蛾∽ｿ｡螳御ｺ・＠縺溘→縺・,
            cached: false,
            cacheMetaKey: "fromUsername",
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
                        }** 縺・**${eventData.raidTargetUserDisplayName}** 縺ｫ **${eventData.viewerCount
                        }** 莠ｺ縺ｮ隕冶・閠・→縺ｨ繧ゅ↓繝ｬ繧､繝峨＠縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "follow",
            name: "繝輔か繝ｭ繝ｼ譎・,
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν繧偵ヵ繧ｩ繝ｭ繝ｼ縺励◆縺ｨ縺・,
            cached: true,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "Firebot"
            },
            activityFeed: {
                icon: "fas fa-heart",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺後ヵ繧ｩ繝ｭ繝ｼ縺励∪縺励◆`;
                }
            }
        },
        {
            id: "sub",
            name: "繧ｵ繝悶せ繧ｯ繝ｩ繧､繝匁凾",
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν繧偵し繝悶せ繧ｯ・医∪縺溘・蜀阪し繝悶せ繧ｯ・峨＠縺溘→縺阪・,
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
                subMessage: "繝・せ繝医Γ繝・そ繝ｼ繧ｸ",
                totalMonths: 10,
                streak: 8
            },
            activityFeed: {
                icon: "fas fa-star",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""}** 縺・${eventData.isResub ? "蜀阪し繝悶せ繧ｯ" : "繧ｵ繝悶せ繧ｯ"
                        } 縺励∪縺励◆・・**${eventData.totalMonths} 繝ｵ譛育岼** ${eventData.subPlan === "Prime"
                            ? "**Twitch Prime**縺ｧ"
                            : `**Tier ${eventData.subPlan.replace("000", "")}**縺ｧ`
                        }`;
                }
            }
        },
        {
            id: "prime-sub-upgraded",
            name: "繝励Λ繧､繝繝ｻ繧ｵ繝悶せ繧ｯ縺ｮ繧｢繝・・繧ｰ繝ｬ繝ｼ繝画凾",
            description: "繝励Λ繧､繝莨壼藤縺九ｉ繧ｵ繝悶せ繧ｯ縺ｫ繧｢繝・・繧ｰ繝ｬ繝ｼ繝峨＠縺溷ｴ蜷・,
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
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺・**Tier ${eventData.subPlan.replace("000", "")}縺ｫ繧｢繝・・繧ｰ繝ｬ繝ｼ繝峨＠縺ｾ縺励◆!**`;
                }
            }
        },
        {
            id: "subs-gifted",
            name: "繧ｵ繝悶せ繧ｯ繧ｮ繝輔ヨ譎・,
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ隱ｰ縺九↓繧ｵ繝悶せ繧ｯ繧ｮ繝輔ヨ繧帝√▲縺溘→縺・,
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
                    return `**${eventData.isAnonymous ? "蛹ｿ蜷阪ぐ繝輔ち繝ｼ" : eventData.gifterUsername}** 縺・{eventData.giftDuration > 1 ? ` **${eventData.giftDuration} 繝ｵ譛・* 縺ｮ` : ""
                        } **Tier ${eventData.subPlan.replace("000", "")}** 繧ｵ繝悶せ繧ｯ繧・**${eventData.gifteeUsername
                        }** 縺ｫ繧ｮ繝輔ヨ縺励∪縺励◆・亥粋險・${eventData.giftSubMonths} 繝ｵ譛磯俣繧ｵ繝悶せ繧ｯ・荏;
                }
            }
        },
        {
            id: "community-subs-gifted",
            name: "繧ｳ繝溘Η繝九ユ繧｣縺ｸ縺ｮ繧ｵ繝悶せ繧ｯ繧ｮ繝輔ヨ譎・,
            description: "隱ｰ縺九′繧ｳ繝溘Η繝九ユ繧｣繝ｼ縺ｫ繧ｵ繝悶せ繧ｯ繧ｮ繝輔ヨ繧定ｴ医▲縺溘→縺・,
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
                    return `**${eventData.isAnonymous ? "蛹ｿ蜷阪ぐ繝輔ち繝ｼ" : eventData.gifterUsername}** 縺・**${eventData.subCount
                        } 蛟九・ Tier ${eventData.subPlan.replace("000", "")}** 繧ｵ繝悶せ繧ｯ繧偵さ繝溘Η繝九ユ繧｣縺ｫ繧ｮ繝輔ヨ縺励∪縺励◆`;
                }
            }
        },
        {
            id: "gift-sub-upgraded",
            name: "繧ｵ繝悶せ繧ｯ繧ｮ繝輔ヨ縺ｮ繧｢繝・・繧ｰ繝ｬ繝ｼ繝画凾",
            description: "繧ｵ繝悶せ繧ｯ繧ｮ繝輔ヨ縺九ｉ繧ｵ繝悶せ繧ｯ縺ｫ繧｢繝・・繧ｰ繝ｬ繝ｼ繝峨＆繧後◆蝣ｴ蜷・,
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
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺後ぐ繝輔ヨ繧ｵ繝悶せ繧ｯ繧・**Tier ${eventData.subPlan.replace("000", "")}** 縺ｫ繧｢繝・・繧ｰ繝ｬ繝ｼ繝峨＠縺ｾ縺励◆・～;
                }
            }
        },
        {
            id: "cheer",
            name: "Cheer",
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ螢ｰ謠ｴ繧帝√▲縺溘→縺搾ｼ医ン繝・ヤ繧剃ｽｿ縺｣縺溘→縺搾ｼ・,
            cached: false,
            manualMetadata: {
                username: "Firebot",
                isAnonymous: false,
                bits: 100,
                totalBits: 1200,
                cheerMessage: "cheer100 繝・せ繝医Γ繝・そ繝ｼ繧ｸ"
            },
            activityFeed: {
                icon: "fad fa-diamond",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺・**${eventData.bits}** 繝薙ャ繝・ｒ蠢懈抄縺励∪縺励◆縲ゅメ繝｣繝ｳ繝阪Ν縺ｧ縺ｮ蜷郁ｨ亥ｿ懈抄繝薙ャ繝・・ **${eventData.totalBits
                        }** 縺ｧ縺吶Ａ;
                }
            }
        },
        {
            id: "bits-badge-unlocked",
            name: "繝薙ャ繝・ヰ繝・ず隗｣髯､譎・,
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ譁ｰ縺励＞繝薙ャ繝・ヰ繝・ず縺ｮ繝ｭ繝・け繧定ｧ｣髯､縺励◆縺ｨ縺・,
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
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺後≠縺ｪ縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ **${eventData.badgeTier}** 繝薙ャ繝・ヰ繝・ず繧定ｧ｣髯､縺励∪縺励◆・～;
                }
            }
        },
        {
            id: "viewer-arrived",
            name: "隕冶・閠・′譚･縺滓凾",
            description: "隕冶・閠・′驟堺ｿ｡縺ｧ譛蛻昴↓繝√Ε繝・ヨ繧偵☆繧九→縺・,
            cached: true,
            cacheMetaKey: "username",
            manualMetadata: {
                username: "Firebot"
            },
            activityFeed: {
                icon: "fad fa-house-return",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺悟芦逹縺励∪縺励◆`;
                }
            }
        },
        {
            id: "chat-cleared",
            name: "繝√Ε繝・ヨ繧呈ｶ医＠縺溘→縺・,
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝・ヨ縺後け繝ｪ繧｢縺輔ｌ縺溷ｴ蜷・,
            cached: false,
            queued: false,
            manualMetadata: {
                username: "firebot",
                userId: ""
            }
        },
        {
            id: "chat-message",
            name: "繝√Ε繝・ヨ譎・,
            description: "繝√Ε繝・ヨ縺梧擂縺滓凾",
            cached: false,
            queued: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                messageText: "繝・せ繝医Γ繝・そ繝ｼ繧ｸ"
            }
        },
        {
            id: "chat-message-deleted",
            name: "繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ蜑企勁",
            description: "閾ｪ蛻・・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝・ヨ繝｡繝・そ繝ｼ繧ｸ縺悟炎髯､縺輔ｌ縺溷ｴ蜷・,
            cached: false,
            queued: false,
            manualMetadata: {
                username: "firebot",
                messageText: "繝・せ繝医Γ繝・そ繝ｼ繧ｸ"
            }
        },
        {
            id: "first-time-chat",
            name: "蛻晏屓繝√Ε繝・ヨ",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｫ蛻昴ａ縺ｦ繝√Ε繝・ヨ縺後≠縺｣縺溘→縺・,
            cached: false,
            queued: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                messageText: "繝・せ繝医Γ繝・そ繝ｼ繧ｸ"
            },
            activityFeed: {
                icon: "fad fa-sparkles",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺悟・繧√※縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝・ヨ縺励∪縺励◆`;
                }
            }
        },
        {
            id: "announcement",
            name: "繧｢繝翫え繝ｳ繧ｹ",
            description: "繧｢繝翫え繝ｳ繧ｹ繧帝∽ｿ｡縺励◆譎・,
            cached: false,
            queued: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                messageText: "繝・せ繝医い繝翫え繝ｳ繧ｹ"
            }
        },
        {
            id: "banned",
            name: "隕冶・閠・ｿｽ謾ｾ譎・,
            description: "隕冶・閠・ｒ霑ｽ謾ｾ縺励◆譎・,
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
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    let message = `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺・**${eventData.moderator}** 縺ｫ繧医▲縺ｦ霑ｽ謾ｾ縺輔ｌ縺ｾ縺励◆縲Ａ;

                    if (eventData.modReason) {
                        message = `${message} 逅・罰: **${eventData.modReason}**`;
                    }
                    return message;
                }
            }
        },
        {
            id: "unbanned",
            name: "隕冶・閠・・霑ｽ謾ｾ隗｣髯､譎・,
            description: "隕冶・閠・ｒ霑ｽ謾ｾ繧定ｧ｣髯､縺励◆譎・,
            cached: false,
            queued: false,
            manualMetadata: {
                username: "CaveMobster",
                moderator: "Firebot"
            },
            activityFeed: {
                icon: "fad fa-gavel",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺ｮ霑ｽ謾ｾ縺・**${eventData.moderator}** 縺ｫ繧医▲縺ｦ隗｣髯､縺輔ｌ縺ｾ縺励◆縲Ａ;
                }
            }
        },
        {
            id: "timeout",
            name: "隕冶・閠・ち繧､繝繧｢繧ｦ繝域凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ隱ｰ縺九′繧ｿ繧､繝繧｢繧ｦ繝域欠遉ｺ縺輔ｌ縺溘→縺・,
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
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    let message = `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺・**${eventData.timeoutDuration} 遘帝俣** ${eventData.moderator} 縺ｫ繧医▲縺ｦ繧ｿ繧､繝繧｢繧ｦ繝医＆繧後∪縺励◆縲Ａ;

                    if (eventData.modReason) {
                        message = `${message} 逅・罰: **${eventData.modReason}**`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-reward-redemption",
            name: "繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ莠､謠帶凾",
            description: "隱ｰ縺九′繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ繧貞茜逕ｨ縺励◆蝣ｴ蜷・,
            cached: true,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            queued: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                rewardName: "繝・せ繝育音蜈ｸ",
                rewardImage: "https://static-cdn.jtvnw.net/automatic-reward-images/highlight-1.png",
                rewardCost: "200",
                messageText: "繝・せ繝医Γ繝・そ繝ｼ繧ｸ"
            },
            activityFeed: {
                icon: "fad fa-circle",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺・**${eventData.rewardName}** 繧剃ｺ､謠帙＠縺ｾ縺励◆${eventData.messageText && !!eventData.messageText.length ? `: *${eventData.messageText}*` : ""
                        }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-fulfilled",
            name: "繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ縺ｮ莠､謠帙′謇ｿ隱阪＆繧後◆縺ｨ縺・,
            description: "繧ｫ繧ｹ繧ｿ繝繝√Ε繝阪Ν縺ｮ繝ｪ繝ｯ繝ｼ繝我ｺ､謠帙′螳御ｺ・謇ｿ隱阪＆繧後◆蝣ｴ蜷・,
            cached: false,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            queued: false,
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
                        }** 縺ｮ **${eventData.rewardName}** 莠､謠帙′謇ｿ隱阪＆繧後∪縺励◆縲・{eventData.messageText && !!eventData.messageText.length ? `*${eventData.messageText}*` : ""
                        }`;
                }
            }
        },
        {
            id: "channel-reward-redemption-canceled",
            name: "繝√Ε繝ｳ繝阪Ν迚ｹ蜈ｸ縺ｮ莠､謠帙′諡貞凄縺輔ｌ縺溘→縺・,
            description: "繝√Ε繝阪Ν縺ｮ迚ｹ蜈ｸ莠､謠帙′諡貞凄/霑秘≡縺輔ｌ縺溷ｴ蜷・,
            cached: false,
            cacheMetaKey: "username",
            cacheTtlInSecs: 1,
            queued: false,
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
                        }** 縺ｮ **${eventData.rewardName}** 莠､謠帙′諡貞凄縺輔ｌ縺ｾ縺励◆縲・{eventData.messageText && !!eventData.messageText.length ? `*${eventData.messageText}*` : ""
                        }`;
                }
            }
        },
        {
            id: "whisper",
            name: "縺輔＆繧・￥",
            description: "隱ｰ縺九′縺ゅ↑縺溘↓縺輔＆繧・＞縺溘→縺・,
            cached: false,
            manualMetadata: {
                username: "firebot",
                userDisplayName: "Firebot",
                userId: "",
                message: "縺輔＆繧・″繝・せ繝・,
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
                        }** 縺後≠縺ｪ縺溘・ **${eventData.sentTo}** 繧｢繧ｫ繧ｦ繝ｳ繝医↓莉･荳九・縺輔＆繧・″繧帝√ｊ縺ｾ縺励◆: ${eventData.message}`;
                }
            }
        },
        {
            id: "chat-mode-changed",
            name: "繝√Ε繝・ヨ繝｢繝ｼ繝牙､画峩譎・,
            description: "繝｢繝・Ξ繝ｼ繧ｿ縺ｫ繧医▲縺ｦ繝√Ε繝・ヨ繝｢繝ｼ繝峨・險ｭ螳壹′譖ｴ譁ｰ縺輔ｌ縺溷ｴ蜷・,
            cached: false,
            queued: false,
            manualMetadata: {
                chatMode: {
                    type: "enum",
                    options: {
                        "emoteonly": "繧ｨ繝｢繝ｼ繝医・縺ｿ",
                        "subscribers": "繧ｵ繝悶せ繧ｯ逋ｻ骭ｲ閠・・縺ｿ",
                        "followers": "繝輔か繝ｭ繝ｯ繝ｼ縺ｮ縺ｿ",
                        "slow": "繧ｹ繝ｭ繝ｼ繝｢繝ｼ繝・,
                        "unique": "繝ｦ繝九・繧ｯ繝√Ε繝・ヨ縺ｮ縺ｿ"
                    },
                    value: "emoteonly"
                },
                chatModeState: {
                    type: "enum",
                    options: {
                        enabled: "譛牙柑",
                        disabled: "辟｡蜉ｹ"
                    },
                    value: "enabled"
                },
                moderator: "Firebot",
                duration: "30"
            },
            activityFeed: {
                icon: "fad fa-comment-alt",
                getMessage: (eventData) => {
                    return `**${eventData.moderator}** 縺ｯ**${eventData.chatMode}**繧・*${eventData.chatModeState}**縺ｫ縺励∪縺励◆`;
                }
            }
        },
        {
            id: "channel-poll-begin",
            name: "繝√Ε繝ｳ繝阪Ν謚慕･ｨ髢句ｧ区凾",
            description: "閾ｪ蛻・・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν謚慕･ｨ縺悟ｧ九∪縺｣縺溘ｉ",
            cached: false,
            queued: false,
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
                    return `繝√Ε繝ｳ繝阪Ν謚慕･ｨ **${eventData.title}** 縺悟ｧ九∪繧翫∪縺励◆.`;
                }
            }
        },
        {
            id: "channel-poll-progress",
            name: "繝√Ε繝ｳ繝阪Ν謚慕･ｨ縺ｫ螟牙喧縺後≠縺｣縺滓凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν謚慕･ｨ縺瑚｡後ｏ繧後◆縺ｨ縺阪・,
            cached: false,
            queued: false,
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
                    return `繝√Ε繝ｳ繝阪Ν謚慕･ｨ **${eventData.title}** 縺瑚｡後ｏ繧後∪縺励◆.`;
                }
            }
        },
        {
            id: "channel-poll-end",
            name: "繝√Ε繝ｳ繝阪Ν謚慕･ｨ邨ゆｺ・凾",
            description: "繝√Ε繝ｳ繝阪Ν繝昴・繝ｫ縺檎ｵゆｺ・＠縺溘→縺・,
            cached: false,
            queued: false,
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
                    return `繝√Ε繝ｳ繝阪Ν謚慕･ｨ **${eventData.title}** 縺ｯ邨ゆｺ・＠縺ｾ縺励◆縲ょ━蜍晏呵｣・ **${eventData.winningChoiceName}** ・・*${eventData.winningChoiceVotes}** 逾ｨ・荏;
                }
            }
        },
        {
            id: "channel-goal-begin",
            name: "繝√Ε繝ｳ繝阪Ν逶ｮ讓咎幕蟋区凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν逶ｮ讓吶′蟋九∪縺｣縺溘ｉ縲・,
            cached: false,
            queued: false,
            manualMetadata: {
                description: "逶ｮ讓吝錐"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message;
                    if (eventData.description) {
                        message = `繝√Ε繝ｳ繝阪Ν逶ｮ讓・${eventData.type} ・・*${eventData.description}**・峨′蟋九∪繧翫∪縺励◆ (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `繝√Ε繝ｳ繝阪Ν逶ｮ讓・${eventData.type} 縺悟ｧ九∪繧翫∪縺励◆ (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-goal-progress",
            name: "繝√Ε繝ｳ繝阪Ν逶ｮ讓吶↓螟牙喧縺後≠縺｣縺滓凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν逶ｮ讓吶′騾ｲ陦後＠縺溘→縺・,
            cached: false,
            queued: false,
            manualMetadata: {
                description: "逶ｮ讓吝錐"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message;
                    if (eventData.description) {
                        message = `繝√Ε繝ｳ繝阪Ν逶ｮ讓・${eventData.type} ・・**${eventData.description}** ・峨′騾ｲ縺ｿ縺ｾ縺励◆ (**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `繝√Ε繝ｳ繝阪Ν逶ｮ讓・${eventData.type} 縺碁ｲ縺ｿ縺ｾ縺励◆(**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-goal-end",
            name: "繝√Ε繝ｳ繝阪Ν逶ｮ讓咏ｵゆｺ・凾",
            description: "繝√Ε繝ｳ繝阪Ν逶ｮ讓吶′邨ゆｺ・＠縺溷ｴ蜷・,
            cached: false,
            queued: false,
            manualMetadata: {
                description: "逶ｮ讓吝錐"
            },
            activityFeed: {
                icon: "fad fa-bullseye-arrow",
                getMessage: (eventData) => {
                    let message;
                    if (eventData.description) {
                        message = `繝√Ε繝ｳ繝阪Ν ${eventData.type} 逶ｮ讓・**${eventData.description}** 縺檎ｵゆｺ・＠縺ｾ縺励◆縲ら岼讓吶・**${eventData.isAchieved ? "驕疲・" : "譛ｪ驕疲・"
                            }**縺ｧ縺励◆縲・**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    } else {
                        message = `繝√Ε繝ｳ繝阪Ν ${eventData.type} 逶ｮ讓吶′邨ゆｺ・＠縺ｾ縺励◆縲ら岼讓吶・**${eventData.isAchieved ? "驕疲・" : "譛ｪ驕疲・"
                            }**縺ｧ縺励◆縲・**${eventData.currentAmount}**/**${eventData.targetAmount}**).`;
                    }
                    return message;
                }
            }
        },
        {
            id: "channel-prediction-begin",
            name: "繝√Ε繝ｳ繝阪Ν莠域Φ髢句ｧ区凾",
            description: "閾ｪ蛻・・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν莠域Φ縺悟ｧ九∪縺｣縺溘ｉ",
            cached: false,
            queued: false,
            manualMetadata: {
                title: "繧ｿ繧､繝医Ν"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `繝√Ε繝ｳ繝阪Ν莠域Φ **${eventData.title}** 縺悟ｧ九∪繧翫∪縺励◆`;
                }
            }
        },
        {
            id: "channel-prediction-progress",
            name: "繝√Ε繝ｳ繝阪Ν莠域Φ縺ｮ騾ｲ謐礼憾豕∵凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν莠域Φ縺碁ｲ陦後＠縺溘→縺阪・,
            cached: false,
            queued: false,
            manualMetadata: {
                title: "繧ｿ繧､繝医Ν"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `繝√Ε繝ｳ繝阪Ν莠域Φ **${eventData.title}** 縺碁ｲ縺ｿ縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "channel-prediction-lock",
            name: "繝√Ε繝ｳ繝阪Ν莠域ｸｬ繝ｭ繝・け譎・,
            description: "閾ｪ蛻・・繝√Ε繝ｳ繝阪Ν縺ｮ繝√Ε繝ｳ繝阪Ν莠域Φ縺後Ο繝・け縺輔ｌ縺溷ｴ蜷医・,
            cached: false,
            queued: false,
            manualMetadata: {
                title: "繧ｿ繧､繝医Ν"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `繝√Ε繝ｳ繝阪Ν莠域Φ **${eventData.title}** 縺ｯ繝ｭ繝・け縺輔ｌ縺ｾ縺励◆.`;
                }
            }
        },
        {
            id: "channel-prediction-end",
            name: "繝√Ε繝ｳ繝阪Ν莠域Φ邨ゆｺ・凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｳ繝阪Ν莠域Φ縺檎ｵゆｺ・＠縺溘→縺阪・,
            cached: false,
            queued: false,
            manualMetadata: {
                title: "繧ｿ繧､繝医Ν"
            },
            activityFeed: {
                icon: "fad fa-question-circle",
                getMessage: (eventData) => {
                    return `繝√Ε繝ｳ繝阪Ν莠域Φ **${eventData.title}** 繧堤ｷ繧∝・繧翫∪縺励◆. 蜍晏茜邨先棡: **${eventData.winningOutcome.title}**.`;
                }
            }
        },
        {
            id: "hype-train-start",
            name: "繝上う繝励ヨ繝ｬ繧､繝ｳ蟋句虚譎・,
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝上う繝励ヨ繝ｬ繧､繝ｳ縺悟ｧ九∪縺｣縺溘ｉ縲・,
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
                    return `繝上う繝励ヨ繝ｬ繧､繝ｳ縺悟ｧ九∪繧翫∪縺励◆`;
                }
            }
        },
        {
            id: "hype-train-progress",
            name: "繝上う繝励ヨ繝ｬ繧､繝ｳ縺ｫ螟牙喧縺後≠縺｣縺滓凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝上う繝励ヨ繝ｬ繧､繝ｳ縺碁ｲ陦後＠縺溘→縺・,
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
                    return `繝ｬ繝吶Ν **${eventData.level}** 縺ｮ繝上う繝励ヨ繝ｬ繧､繝ｳ縺檎樟蝨ｨ **${Math.floor(
                        (eventData.progress / eventData.goal) * 100
                    )}%** 縺ｾ縺ｧ騾ｲ陦後＠縺ｦ縺・∪縺兪;
                }
            }
        },
        {
            id: "hype-train-end",
            name: "繝上う繝励ヨ繝ｬ繧､繝ｳ邨ゆｺ・凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｮ繝上う繝励ヨ繝ｬ繧､繝ｳ縺檎ｵゅｏ繧九→縺阪・,
            cached: false,
            queued: false,
            manualMetadata: {
                total: "150",
                level: "1"
            },
            activityFeed: {
                icon: "fad fa-train",
                getMessage: (eventData) => {
                    return `繝上う繝励ヨ繝ｬ繧､繝ｳ Lv **${eventData.level}** 縺檎ｵゆｺ・＠縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "stream-online",
            name: "驟堺ｿ｡髢句ｧ区凾",
            description: "驟堺ｿ｡縺悟ｧ九∪繧九→縺・,
            cached: false,
            queued: false,
            manualMetadata: { },
            activityFeed: {
                icon: "fad fa-play-circle",
                getMessage: () => {
                    return `驟堺ｿ｡縺悟ｧ九∪繧翫∪縺励◆`;
                }
            }
        },
        {
            id: "stream-offline",
            name: "驟堺ｿ｡邨ゆｺ・凾",
            description: "驟堺ｿ｡縺檎ｵゆｺ・＠縺溘→縺・,
            cached: false,
            queued: false,
            manualMetadata: { },
            activityFeed: {
                icon: "fad fa-stop-circle",
                getMessage: () => {
                    return `驟堺ｿ｡邨ゆｺ・＠縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "charity-campaign-start",
            name: "繝√Ε繝ｪ繝・ぅ繧ｭ繝｣繝ｳ繝壹・繝ｳ髢句ｧ区凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｧ繝√Ε繝ｪ繝・ぅ繝ｼ繧ｭ繝｣繝ｳ繝壹・繝ｳ繧貞ｧ九ａ縺溘→縺・,
            cached: false,
            queued: false,
            manualMetadata: {
                charityName: "Great Cause, LLC",
                charityDescription: "蠖ｼ繧峨・譛ｬ蠖薙↓邏譎ｴ繧峨＠縺・ｻ穂ｺ九ｒ縺励※縺・ｋ",
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
                    return `繝√Ε繝ｪ繝・ぅ繝ｻ繧ｭ繝｣繝ｳ繝壹・繝ｳ **${eventData.charityName}** 縺悟ｧ九∪繧翫∪縺励◆.`;
                }
            }
        },
        {
            id: "charity-donation",
            name: "繝√Ε繝ｪ繝・ぅ繝ｼ蟇・ｻ俶凾",
            description: "隱ｰ縺九′縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｮ繝√Ε繝ｪ繝・ぅ繝ｻ繧ｭ繝｣繝ｳ繝壹・繝ｳ縺ｫ蟇・ｻ倥＠縺溘→縺阪・,
            cached: false,
            queued: false,
            manualMetadata: {
                from: "Firebot",
                charityName: "Great Cause, LLC",
                charityDescription: "蠖ｼ繧峨・譛ｬ蠖薙↓邏譎ｴ繧峨＠縺・ｻ穂ｺ九ｒ縺励※縺・ｋ",
                charityWebsite: "https://somewebsite.org",
                charityLogo: "https://somewebsite.org/logo.png",
                donationAmount: "10",
                donationCurrency: "USD"
            },
            activityFeed: {
                icon: "fad fa-hand-holding-heart",
                getMessage: (eventData) => {
                    return `**${eventData.from}** 縺ｯ **${eventData.donationAmount} ${eventData.donationCurrency}** 蟇・ｻ倥＠縺ｾ縺励◆.`;
                }
            }
        },
        {
            id: "charity-campaign-progress",
            name: "繝√Ε繝ｪ繝・ぅ繝ｻ繧ｭ繝｣繝ｳ繝壹・繝ｳ縺ｮ騾ｲ謐励↓螟牙喧縺後≠縺｣縺滓凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｮ繝√Ε繝ｪ繝・ぅ繝ｻ繧ｭ繝｣繝ｳ繝壹・繝ｳ縺碁ｲ陦後☆繧九→縺阪・,
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
                    return `繝√Ε繝ｪ繝・ぅ繧ｭ繝｣繝ｳ繝壹・繝ｳ邱城｡・ **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**.`;
                }
            }
        },
        {
            id: "charity-campaign-end",
            name: "繝√Ε繝ｪ繝・ぅ繧ｭ繝｣繝ｳ繝壹・繝ｳ邨ゆｺ・凾",
            description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｮ繝√Ε繝ｪ繝・ぅ繧ｭ繝｣繝ｳ繝壹・繝ｳ縺檎ｵゆｺ・＠縺溘→縺阪・,
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
                    return `繝√Ε繝ｪ繝・ぅ繧ｭ繝｣繝ｳ繝壹・繝ｳ縺檎ｵゆｺ・＠縺ｾ縺励◆縲ら岼讓咎＃謌・ **${eventData.goalReached ? "縺ｯ縺・ : "縺・＞縺・
                        }**縲らｷ城｡・ **${eventData.currentTotalAmount} ${eventData.currentTotalCurrency}**縲Ａ;
                }
            }
        },
        {
            id: "shoutout-sent",
            name: "Twitch繧ｷ繝｣繧ｦ繝医い繧ｦ繝磯∽ｿ｡譎・,
            description: "縺ゅ↑縺溘ｄ縲√Δ繝・Ξ繝ｼ繧ｿ繝ｼ縺御ｻ悶・繝√Ε繝ｳ繝阪Ν縺ｫTwitch繧ｷ繝｣繧ｦ繝医い繧ｦ繝医ｒ騾∽ｿ｡縺励◆蝣ｴ蜷医・,
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
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.moderator}** 縺・**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺ｫ繧ｷ繝｣繧ｦ繝医い繧ｦ繝医ｒ騾√ｊ縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "shoutout-received",
            name: "繧ｷ繝｣繧ｦ繝医ｒ蜿嶺ｿ｡縺励◆譎・,
            description: "莉悶・繝√Ε繝ｳ繝阪Ν縺後≠縺ｪ縺溘↓Twitch縺ｮ繧ｷ繝｣繧ｦ繝医ｒ騾√▲縺ｦ縺阪◆縺ｨ縺・,
            cached: false,
            queued: false,
            manualMetadata: {
                username: "Firebot",
                viewerCount: 10
            },
            activityFeed: {
                icon: "fad fa-bullhorn",
                getMessage: (eventData) => {
                    const showUserIdName = eventData.username.toLowerCase() !== eventData.userDisplayName.toLowerCase();
                    return `**${eventData.userDisplayName}${showUserIdName ? ` (${eventData.username})` : ""
                        }** 縺後≠縺ｪ縺溘・繝√Ε繝ｳ繝阪Ν繧・${eventData.viewerCount} 莠ｺ縺ｮ隕冶・閠・↓繧ｷ繝｣繧ｦ繝医い繧ｦ繝医＠縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "category-changed",
            name: "繧ｫ繝・ざ繝ｪ繝ｼ螟画峩譎・,
            description: "Twitch驟堺ｿ｡繧ｫ繝・ざ繝ｪ繝ｼ繧貞､画峩縺励◆蝣ｴ蜷医・,
            cached: false,
            manualMetadata: {
                category: "Just Chatting"
            },
            activityFeed: {
                icon: "fad fa-th-large",
                getMessage: (eventData) => {
                    return `驟堺ｿ｡繧ｫ繝・ざ繝ｪ繝ｼ繧・**${eventData.category}** 縺ｫ螟画峩縺励∪縺励◆`;
                }
            }
        },
        {
            id: "title-changed",
            name: "繧ｿ繧､繝医Ν螟画峩譎・,
            description: "Twitch繧ｹ繝医Μ繝ｼ繝縺ｮ繧ｿ繧､繝医Ν繧貞､画峩縺吶ｋ縺ｨ縺阪・,
            cached: false,
            manualMetadata: {
                title: "Stream Title"
            },
            activityFeed: {
                icon: "fad fa-text",
                getMessage: (eventData) => {
                    return `驟堺ｿ｡繧ｿ繧､繝医Ν繧・**${eventData.title}** 縺ｫ螟画峩縺励∪縺励◆`;
                }
            }
        },
        {
            id: "ad-break-upcoming",
            name: "蠎・相縺ｮ髢句ｧ倶ｺ亥相繧貞女縺大叙縺｣縺溘→縺・,
            description: "蠎・相縺ｮ莠育ｴ・′縺阪◆縺ｨ縺・,
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
                            ? `${mins}蛻・{remainingSecs > 0 ? ` ${remainingSecs}遘蛋 : ""}`
                            : `${eventData.adBreakDuration}遘蛋;

                    const minutesUntilNextAdBreak = Math.round(eventData.secondsUntilNextAdBreak / 60);

                    return `**${friendlyDuration}**縺ｮ莠育ｴ・ｺ・相縺檎ｴ・*${minutesUntilNextAdBreak}**蛻・ｾ後↓髢句ｧ九＆繧後∪縺兪;
                }
            }
        },
        {
            id: "ad-break-start",
            name: "蠎・相縺悟ｧ九∪縺｣縺溘→縺・,
            description: "蠎・相縺悟ｧ九∪縺｣縺・,
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
                            ? `${mins}蛻・{remainingSecs > 0 ? ` ${remainingSecs}遘蛋 : ""}`
                            : `${eventData.adBreakDuration}遘蛋;

                    return `**${friendlyDuration}**縺ｮ**${eventData.isAdBreakScheduled ? "莠育ｴ・ : "謇句虚"
                        }**蠎・相縺碁幕蟋九＆繧後∪縺励◆`;
                }
            }
        },
        {
            id: "ad-break-end",
            name: "蠎・相縺檎ｵゆｺ・＠縺溘→縺・,
            description: "蠎・相縺檎ｵゆｺ・＠縺溘→縺・,
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
                            ? `${mins}蛻・{remainingSecs > 0 ? ` ${remainingSecs}遘蛋 : ""}`
                            : `${eventData.adBreakDuration}遘蛋;

                    return `**${friendlyDuration}**縺ｮ**${eventData.isAdBreakScheduled ? "莠育ｴ・ : "謇句虚"
                        }**蠎・相縺檎ｵゆｺ・＠縺ｾ縺励◆`;
                }
            }
        }
    ]
};
