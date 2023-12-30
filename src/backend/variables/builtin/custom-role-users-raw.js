"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const customRolesManager = require("../../roles/custom-roles-manager");

module.exports = {
    definition: {
        handle: "rawCustomRoleUsers",
        usage: "rawCustomRoleUsers[role]",
        description: "指定された役割に属するすべてのユーザの配列を返します。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, role) => {
        if (role == null || role === '') {
            return [];
        }

        const customRole = customRolesManager.getRoleByName(role);

        return customRole?.viewers || [];
    }
};