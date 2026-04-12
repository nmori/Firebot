"use strict";

/**
 * The firebot event source
 */
const firebotEventSource = {
    id: "firebot",
    name: "Firebot",
    description: "Firebot 蜀・〒逋ｺ逕溘☆繧句庄閭ｽ諤ｧ縺ｮ縺ゅｋ驥崎ｦ√↑繧､繝吶Φ繝・,
    events: [
        {
            id: "chat-connected",
            name: "Twitch 謗･邯壽凾",
            description: "Firebot縺卦witch縺ｫ謗･邯壹＠縺溘→縺・,
            cached: false,
            activityFeed: {
                icon: "fad fa-plug",
                getMessage: () => {
                    return `Twitch 縺ｫ謗･邯壹＠縺ｾ縺励◆`;
                }
            }
        },
        {
            id: "overlay-connected",
            name: "Overlay Connected",
            description: "When a Firebot overlay is connected.",
            cached: false,
            manualMetadata: {
                instanceName: "Default"
            },
            activityFeed: {
                icon: "fad fa-tv-alt",
                getMessage: (eventData) => {
                    return `**${eventData.instanceName}** overlay connected`;
                }
            }
        },
        {
            id: "view-time-update",
            name: "譎る俣諠・ｱ譖ｴ譁ｰ譎・,
            description: "隕冶・譎る俣縺梧峩譁ｰ縺輔ｌ縺溘→縺・,
            cached: false,
            manualMetadata: {
                username: "Firebot",
                previousViewTime: 1,
                newViewTime: 2
            }
        },
        {
            id: "currency-update",
            name: "騾夊ｲｨ譖ｴ譁ｰ譎・,
            description: "隕冶・閠・・騾夊ｲｨ縺悟､峨ｏ縺｣縺溘→縺・,
            cached: false,
            manualMetadata: {
                username: "Firebot",
                currencyName: "繧ｳ繧､繝ｳ",
                previousCurrencyAmount: 1,
                newCurrencyAmount: 2
            }
        },
        {
            id: "viewer-created",
            name: "隕冶・閠・ュ蝣ｱ霑ｽ蜉譎・,
            description: "隕冶・閠・′譛蛻昴↓隕冶・閠・ョ繝ｼ繧ｿ繝吶・繧ｹ縺ｫ菫晏ｭ倥＆繧後ｋ縺ｨ縺・,
            cached: false,
            manualMetadata: {
                username: "Firebot"
            }
        },
        {
            id: "firebot-started",
            name: "Firebot 襍ｷ蜍墓凾",
            description: "Firebot縺瑚ｵｷ蜍輔＠縺溘→縺・,
            cached: false
        },
        {
            id: "custom-variable-expired",
            name: "繧ｫ繧ｹ繧ｿ繝螟画焚縺ｮ譛牙柑譛滄剞蛻・ｌ譎・,
            description: "繧ｫ繧ｹ繧ｿ繝螟画焚縺ｮ譛牙柑譛滄剞縺悟・繧後◆縺ｨ縺・,
            cached: false
        },
        {
            id: "custom-variable-set",
            name: "繧ｫ繧ｹ繧ｿ繝螟画焚縺ｮ菴懈・譎・,
            description: "繧ｫ繧ｹ繧ｿ繝螟画焚縺御ｽ懈・縺輔ｌ縺溘→縺・,
            cached: false
        },
        {
            id: "highlight-message",
            name: "繝√Ε繝・ヨ繧ｹ繝昴ャ繝医Λ繧､繝域凾",
            description: "繧ｪ繝ｼ繝舌・繝ｬ繧､陦ｨ遉ｺ縺ｪ縺ｩ縲√Γ繝・そ繝ｼ繧ｸ縺ｫ繧ｹ繝昴ャ繝医Λ繧､繝医ｒ蠖薙※縺滓凾",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                messageText: "繝・せ繝医Γ繝・そ繝ｼ繧ｸ"
            }
        },
        {
            id: "category-changed",
            name: "繧ｫ繝・ざ繝ｪ繝ｼ螟画峩譎・,
            description: "繝繝・す繝･繝懊・繝峨〒驟堺ｿ｡繧ｫ繝・ざ繝ｪ繝ｼ繧貞､画峩縺励◆譎・,
            cached: false,
            manualMetadata: {
                category: "Just Chatting"
            }
        },
        {
            id: "effect-queue-cleared",
            name: "貍泌・繧ｭ繝･繝ｼ縺後け繝ｪ繧｢縺輔ｌ縺溘→縺・,
            description: "貍泌・繧ｭ繝･繝ｼ縺ｮ螳溯｡後′邨ゆｺ・＠縲√け繝ｪ繧｢縺輔ｌ縺溘→縺・,
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting"
            }
        },
        {
            id: "effect-queue-added",
            name: "貍泌・繧ｭ繝･繝ｼ霑ｽ蜉",
            description: "貍泌・繧ｭ繝･繝ｼ縺ｫ譁ｰ縺励＞鬆・岼縺瑚ｿｽ蜉縺輔ｌ縺溘→縺阪・,
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting"
            }
        },
        {
            id: "effect-queue-status",
            name: "貍泌・繧ｭ繝･繝ｼ縺ｮ繧ｹ繝・・繧ｿ繧ｹ螟画峩",
            description: "貍泌・繧ｭ繝･繝ｼ縺ｮ繧ｹ繝・・繧ｿ繧ｹ縺悟､画峩縺輔ｌ縺溘→縺阪・,
            cached: false,
            manualMetadata: {
                queueName: "Just Chatting",
                status: "paused"
            }
        },
        {
            id: "before-firebot-closed",
            name: "Firebot縺檎ｵゆｺ・☆繧九→縺・,
            description: "Firebot縺檎ｵゆｺ・☆繧九→縺・,
            cached: false
        },
        {
            id: "viewer-rank-updated",
            name: "隕冶・閠・Λ繝ｳ繧ｯ縺梧峩譁ｰ縺輔ｌ縺溘→縺・,
            description: "隕冶・閠・・繝ｩ繝ｳ繧ｯ縺梧峩譁ｰ縺輔ｌ縺溘→縺阪・,
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
            name: "Viewer Metadata Updated",
            description: "When a viewer's metadata value is updated.",
            cached: false,
            manualMetadata: {
                username: "Firebot",
                metadataKey: "testKey",
                metadataValue: "testValue"
            }
        }
    ]
};

module.exports = firebotEventSource;
