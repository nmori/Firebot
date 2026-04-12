"use strict";

const TwitchApi = require("../../twitch-api/api");
const accountAccess = require("../../common/account-access");
const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");

const model = {
    definition: {
        handle: "category",
        aliases: ["game"],
        description: "縺ゅ↑縺溘・繝√Ε繝ｳ繝阪Ν縺ｫ險ｭ螳壹＆繧後※縺・ｋ迴ｾ蝨ｨ縺ｮ繧ｫ繝・ざ繝ｪ/繧ｲ繝ｼ繝繧貞叙蠕励＠縺ｾ縺吶・,
        examples: [
            {
                usage: "category[$target]",
                description: "繧ｳ繝槭Φ繝峨・蝣ｴ蜷医√ち繝ｼ繧ｲ繝・ヨ繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ險ｭ螳壹＆繧後※縺・ｋ繧ｫ繝・ざ繝ｪ/繧ｲ繝ｼ繝繧貞叙蠕励＠縺ｾ縺吶・
            },
            {
                usage: "category[$user]",
                description: "髢｢騾｣縺吶ｋ繝ｦ繝ｼ繧ｶ繝ｼ・医さ繝槭Φ繝峨ｒ繝医Μ繧ｬ繝ｼ縺励◆莠ｺ縲√・繧ｿ繝ｳ繧呈款縺励◆莠ｺ縺ｪ縺ｩ・峨↓險ｭ螳壹＆繧後※縺・ｋ繧ｫ繝・ざ繝ｪ繝ｼ/繧ｲ繝ｼ繝繧貞叙蠕励＠縺ｾ縺吶・
            },
            {
                usage: "category[ChannelOne]",
                description: "迚ｹ螳壹・繝√Ε繝ｳ繝阪Ν縺ｫ險ｭ螳壹＆繧後※縺・ｋ繧ｫ繝・ざ繝ｪ/繧ｲ繝ｼ繝繧貞叙蠕励＠縺ｾ縺吶・
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (trigger, username) => {
        if (username === undefined || username == null) {
            if (trigger.metadata?.username === undefined || trigger.metadata?.username == null) {
                username = accountAccess.getAccounts().streamer.username;
            } else {
                username = trigger.metadata?.username;
            }
        }

        const channelInfo = await TwitchApi.channels.getChannelInformationByUsername(username);

        return channelInfo?.gameName || "";
    }
};

module.exports = model;
