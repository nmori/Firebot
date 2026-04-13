"use strict";

const { TwitchApi } = require("../../../../../streaming-platforms/twitch/api");
const roleHelpers = require("../../../../../roles/role-helpers").default;

function normalizeViewerRoleComparisonType(comparisonType) {
    const hasRoleAliases = new Set([
        "役割を担当",
        "を含む",
        "含む",
        "has role",
        "include",
        "is in role",
        "including",
        "contains",
        "含んでいる",
        "を配列に含む",
        "厳格に一致"
    ]);

    const hasNotRoleAliases = new Set([
        "役割を担当していない",
        "を含まない",
        "doesn't have role",
        "doesn't include",
        "isn't in role",
        "not including",
        "doesn't contain",
        "含まない",
        "を配列に含まない",
        "厳格に不一致"
    ]);

    if (hasRoleAliases.has(comparisonType)) {
        return "has role";
    }

    if (hasNotRoleAliases.has(comparisonType)) {
        return "doesn't have role";
    }

    return comparisonType;
}

module.exports = {
    id: "firebot:viewerroles",
    name: "視聴者の役割",
    description: "与えられた視聴者の役割に基づく条件",
    comparisonTypes: ["役割を担当", "役割を担当していない"],
    leftSideValueType: "text",
    leftSideTextPlaceholder: "ユーザ名を入力",
    rightSideValueType: "preset",
    getRightSidePresetValues: (viewerRolesService) => {
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
        const normalizedComparisonType = normalizeViewerRoleComparisonType(comparisonType);

        let username = leftSideValue;
        if ((username == null || username === "") && (rawLeftSideValue == null || rawLeftSideValue === "")) {
            username = trigger.metadata.username;
        }

        const user = await TwitchApi.users.getUserByName(username);
        if (user == null) {
            return false;
        }

        const hasRole = await roleHelpers.viewerHasRoles(user.id, [rightSideValue]);

        switch (normalizedComparisonType) {
            case "has role":
                return hasRole;
            case "doesn't have role":
                return !hasRole;
            default:
                return false;
        }
    }
};