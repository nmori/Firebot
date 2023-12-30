"use strict";

const twitchRoles = [
    {
        id: "broadcaster",
        name: "配信者"
    },
    {
        id: "mod",
        name: "モデレータ"
    },
    {
        id: "vip",
        name: "VIP"
    },
    {
        id: "sub",
        name: "サブスクライバー"
    },
    {
        id: "tier1",
        name: "Tier 1 サブスク"
    },
    {
        id: "tier2",
        name: "Tier 2 サブスク"
    },
    {
        id: "tier3",
        name: "Tier 3 サブスク"
    },
    {
        id: "viewerlistbot",
        name: "Bot"
    }
];

function mapMixerRoleIdToTwitchRoleId(mixerRoleId) {
    switch (mixerRoleId) {
        case "Subscriber":
            return "sub";
        case "Mod":
        case "ChannelEditor":
            return "mod";
        case "Owner":
            return "broadcaster";
    }
    return mixerRoleId;
}

exports.getTwitchRoles = () => twitchRoles;
/**
 * @param {string} role
 * @returns {{id: string; name: string}}
 * */
exports.mapTwitchRole = role => {
    if (role === "founder") {
        return twitchRoles.find(r => r.id === 'sub');
    }
    return twitchRoles.find(r => r.id === role);
};
exports.mapMixerRoleIdToTwitchRoleId = mapMixerRoleIdToTwitchRoleId;
