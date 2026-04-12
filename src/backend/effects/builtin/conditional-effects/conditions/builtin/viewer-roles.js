"use strict";

<<<<<<< HEAD
const { viewerHasRoles } = require("../../../../../roles/role-helpers");
=======
const twitchApi = require("../../../../../twitch-api/api");
const roleHelpers = require("../../../../../roles/role-helpers").default;
const { ComparisonType } = require("../../../../../../shared/filter-constants");
const { mapLegacyComparisonType } = require("../../../../../../shared/filter-helpers");
const logger = require("../../../../../logwrapper");
>>>>>>> acc0d1650948b571be1965b088227ce437aabd20

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
        
        // 旧式のComparisonTypeを標準化
        const standardComparisonType = mapLegacyComparisonType(comparisonType);

        let username = leftSideValue;
        if ((username == null || username === "") && (rawLeftSideValue == null || rawLeftSideValue === "")) {
            username = trigger.metadata.username;
        }

        const hasRole = await viewerHasRoles(username, [rightSideValue]);

        // シンプル化されたswitch文
        switch (standardComparisonType) {
            case ComparisonType.HAS_ROLE:
                return hasRole;
            case ComparisonType.HAS_NOT_ROLE:
                return !hasRole;
            default:
                logger.warn(`(${this.name})判定条件が不正です: :${comparisonType} (標準化後: ${standardComparisonType})`);
                return false;
        }
    }
};
