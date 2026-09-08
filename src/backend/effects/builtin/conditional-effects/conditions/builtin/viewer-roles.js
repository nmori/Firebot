"use strict";

const { TwitchApi } = require("../../../../../streaming-platforms/twitch/api");
const roleHelpers = require("../../../../../roles/role-helpers").default;

// Older JP builds saved role comparisons using the generic "contains" wording, which
// LegacyConditionComparisonTypeMap can only normalize to "contains"/"does not contain"
// because those labels mean something else on every other condition. Map them the rest
// of the way here, where the role semantics are unambiguous.
function normalizeViewerRoleComparisonType(comparisonType) {
    const hasRoleAliases = new Set([
        "has role",
        "contains",
        "is strictly",
        "include",
        "is in role",
        "including",
        "を含む"
    ]);

    const hasNotRoleAliases = new Set([
        "doesn't have role",
        "does not contain",
        "doesn't contain",
        "is not strictly",
        "doesn't include",
        "isn't in role",
        "not including",
        "を含まない"
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
    comparisonTypes: ["has role", "doesn't have role"],
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
