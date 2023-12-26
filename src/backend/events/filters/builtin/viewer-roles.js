"use strict";

const customRolesManager = require("../../../roles/custom-roles-manager");
const teamRolesManager = require("../../../roles/team-roles-manager");
const twitchRolesManager = require("../../../../shared/twitch-roles");
const chatRolesManager = require("../../../roles/chat-roles-manager");

module.exports = {
    id: "firebot:viewerroles",
    name: "視聴者の役割",
    description: "視聴者の役割でフィルタ",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" },
        { eventSourceId: "twitch", eventId: "subs-gifted" },
        { eventSourceId: "twitch", eventId: "sub" },
        { eventSourceId: "twitch", eventId: "prime-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "gift-sub-upgraded" },
        { eventSourceId: "twitch", eventId: "follow" },
        { eventSourceId: "streamlabs", eventId: "follow" },
        { eventSourceId: "twitch", eventId: "raid" },
        { eventSourceId: "twitch", eventId: "viewer-arrived" },
        { eventSourceId: "twitch", eventId: "chat-message" },
        { eventSourceId: "twitch", eventId: "whisper" },
        { eventSourceId: "streamloots", eventId: "purchase" },
        { eventSourceId: "streamloots", eventId: "redemption" },
        { eventSourceId: "firebot", eventId: "view-time-update" }
    ],
    comparisonTypes: ["に属している", "に属していない"],
    valueType: "preset",
    presetValues: viewerRolesService => {
        return viewerRolesService
            .getCustomRoles()
            .concat(viewerRolesService.getTwitchRoles())
            .concat(viewerRolesService.getTeamRoles())
            .map(r => ({value: r.id, display: r.name}));

    },
    valueIsStillValid: (filterSettings, viewerRolesService) => {
        const allRoles = viewerRolesService
            .getCustomRoles()
            .concat(viewerRolesService.getTeamRoles())
            .concat(viewerRolesService.getTwitchRoles());

        const role = allRoles.find(r => r.id === filterSettings.value);

        return role != null && role.name != null;
    },
    getSelectedValueDisplay: (filterSettings, viewerRolesService) => {
        const allRoles = viewerRolesService.getCustomRoles()
            .concat(viewerRolesService.getTeamRoles())
            .concat(viewerRolesService.getTwitchRoles());

        const role = allRoles.find(r => r.id === filterSettings.value);

        if (role) {
            return role.name;
        }

        return filterSettings.value;
    },
    predicate: async (filterSettings, eventData) => {

        const { comparisonType, value } = filterSettings;
        const { eventMeta } = eventData;

        const username = eventMeta.username;
        if (username == null || username === "") {
            return false;
        }

        /** @type{string[]} */
        let twitchUserRoles = eventMeta.twitchUserRoles;
        if (twitchUserRoles == null) {
            twitchUserRoles = await chatRolesManager.getUsersChatRoles(username);
        }

        const userCustomRoles = customRolesManager.getAllCustomRolesForViewer(username) || [];
        const userTeamRoles = await teamRolesManager.getAllTeamRolesForViewer(username) || [];
        const userTwitchRoles = (twitchUserRoles || [])
            .map(twitchRolesManager.mapTwitchRole);

        const allRoles = [
            ...userTwitchRoles,
            ...userTeamRoles,
            ...userCustomRoles
        ].filter(r => r != null);

        const hasRole = allRoles.some(r => r.id === value);

        switch (comparisonType) {
        case "include":
        case "に属している":
                return hasRole;
        case "doesn't include":
        case "に属していない":
                return !hasRole;
        default:
            return false;
        }
    }
};