"use strict";

const customRolesManager = require("../../../roles/custom-roles-manager");
const teamRolesManager = require("../../../roles/team-roles-manager");
const twitchRolesManager = require("../../../../shared/twitch-roles");
const chatRolesManager = require("../../../roles/chat-roles-manager");
const twitchApi = require("../../../twitch-api/api");

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
    comparisonTypes: ["include", "doesn't include"],
    valueType: "preset",
    presetValues: (viewerRolesService) => {
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

        const { username } = eventMeta;
        if (!username) {
            return false;
        }

        try {
            const user = await twitchApi.users.getUserByName(username);
            if (user == null) {
                return false;
            }

            const userCustomRoles = customRolesManager.getAllCustomRolesForViewer(user.id) || [];
            const userTeamRoles = await teamRolesManager.getAllTeamRolesForViewer(user.id) || [];
            const userTwitchRoles = await chatRolesManager.getUsersChatRoles(user.id);

            const allRoles = [
                ...userTwitchRoles,
                ...userTeamRoles,
                ...userCustomRoles
            ].filter(r => r != null);

            const hasRole = allRoles.some(r => r.id === value);

            switch (comparisonType) {
                case "include":
                    return hasRole;
                case "doesn't include":
                    return !hasRole;
                default:
                    return false;
            }
        } catch {
            // Silently fail
        }

        return false;
    }
};