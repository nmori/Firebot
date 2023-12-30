"use strict";

const { viewerHasRoles } = require("../../../../../roles/role-helpers");

module.exports = {
    id: "firebot:viewerroles",
    name: "Ž‹’®ŽÒ‚Ì–ðŠ„",
    description: "—^‚¦‚ç‚ê‚½Ž‹’®ŽÒ‚Ì–ðŠ„‚ÉŠî‚Ã‚­ðŒ",
    comparisonTypes: ["–ðŠ„‚ð’S“–", "–ðŠ„‚ð’S“–‚µ‚Ä‚¢‚È‚¢"],
    leftSideValueType: "text",
    leftSideTextPlaceholder: "ƒ†[ƒU–¼‚ð“ü—Í",
    rightSideValueType: "preset",
    getRightSidePresetValues: viewerRolesService => {
        return viewerRolesService.getAllRoles()
            .map(r => ({
                value: r.id,
                display: r.name
            }));
    },
    valueIsStillValid: (condition, viewerRolesService) => {
        const role = viewerRolesService.getAllRoles()
            .find(r => r.id === condition.rightSideValue);

        return role != null && role.name != null;
    },
    getRightSideValueDisplay: (condition, viewerRolesService) => {
        const role = viewerRolesService.getAllRoles()
            .find(r => r.id === condition.rightSideValue);

        if (role) {
            return role.name;
        }

        return condition.rightSideValue;
    },
    predicate: async (conditionSettings, trigger) => {

        const { comparisonType, leftSideValue, rightSideValue, rawLeftSideValue } = conditionSettings;

        let username = leftSideValue;
        if ((username == null || username === "") && (rawLeftSideValue == null || rawLeftSideValue === "")) {
            username = trigger.metadata.username;
        }

        const hasRole = await viewerHasRoles(username, [rightSideValue]);

        switch (comparisonType) {
        case "include":
        case "is in role":
        case "has role":
        case "–ðŠ„‚ð’S“–":
            return hasRole;
        case "doesn't include":
        case "isn't in role":
        case "doesn't have role":
        case "–ðŠ„‚ð’S“–‚µ‚Ä‚¢‚È‚¢":
            return !hasRole;
        default:
            return false;
        }
    }
};