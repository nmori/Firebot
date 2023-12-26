"use strict";

const { viewerHasRoles } = require("../../../../../roles/role-helpers");

module.exports = {
    id: "firebot:viewerroles",
    name: "視聴者の役割",
    description: "与えられた視聴者の役割に基づく条件",
    comparisonTypes: ["に属している", "に属していない"],
    leftSideValueType: "text",
    leftSideTextPlaceholder: "ユーザ名を入力",
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

        const { comparisonType, leftSideValue, rightSideValue } = conditionSettings;

        let username = leftSideValue;
        if (username == null || username === "") {
            username = trigger.metadata.username;
        }

        const hasRole = await viewerHasRoles(username, [rightSideValue]);

        switch (comparisonType) {
        case "include":
        case "is in role":
        case "has role":
        case "に属している":
            return hasRole;
        case "doesn't include":
        case "isn't in role":
        case "doesn't have role":
        case "に属していない":
                return !hasRole;
        default:
            return false;
        }
    }
};