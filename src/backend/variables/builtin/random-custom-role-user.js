"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const customRolesManager = require("../../roles/custom-roles-manager");
const util = require("../../utility");

module.exports = {
    definition: {
        handle: "randomCustomRoleUser",
        usage: "randomCustomRoleUser[role]",
        description: "指定された役割を持つランダムなユーザを返します。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, role) => {
        if (role == null || role === '') {
            return "[役割が指定されていない]";
        }

        const customRole = customRolesManager.getRoleByName(role);

        if (customRole == null) {
            return `[役割 ${role} が存在しません。]`;
        }

        if (customRole.viewers.length === 0) {
            return "";
        }

        const randIndex = util.getRandomInt(0, customRole.viewers.length - 1);

        return customRole.viewers[randIndex];
    }
};