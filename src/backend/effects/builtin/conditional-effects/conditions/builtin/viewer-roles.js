"use strict";

const twitchApi = require("../../../../../twitch-api/api");
const roleHelpers = require("../../../../../roles/role-helpers").default;
const { ComparisonType } = require("../../../../../../shared/filter-constants");
const logger = require("../../../../../logwrapper");

module.exports = {
    id: "firebot:viewerroles",
    name: "視聴者の役割",
    description: "与えられた視聴者の役割に基づく条件",
    comparisonTypes: [
        ComparisonType.HAS_ROLE,
        ComparisonType.HAS_NOT_ROLE
    ],
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

        let username = leftSideValue;
        if ((username == null || username === "") && (rawLeftSideValue == null || rawLeftSideValue === "")) {
            username = trigger.metadata.username;
        }

        const user = await twitchApi.users.getUserByName(username);
        if (user == null) {
            return false;
        }

        const hasRole = await roleHelpers.viewerHasRoles(user.id, [rightSideValue]);

        switch (comparisonType) {
            case "include":
            case "is in role":
            case "has role":
            case ComparisonType.HAS_ROLE:
                return hasRole;
            case "doesn't include":
            case "isn't in role":
            case "doesn't have role":
            case ComparisonType.HAS_NOT_ROLE:
                return !hasRole;
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType}`);
                return false;
        }
    }
};