"use strict";

const { OutputDataType, VariableCategory } = require("../../../shared/variable-constants");
const customRolesManager = require("../../roles/custom-roles-manager");

module.exports = {
    definition: {
        handle: "customRoleUsers",
        usage: "customRoleUsers[role]",
        description: "指定された役割に属するすべてのユーザの配列を返します。",
        categories: [VariableCategory.USER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: async (_, role) => {
        if (role == null || role === '') {
            return JSON.stringify([]);
        }

        const customRole = customRolesManager.getRoleByName(role);

        return JSON.stringify(customRole?.viewers || []);
    }
};