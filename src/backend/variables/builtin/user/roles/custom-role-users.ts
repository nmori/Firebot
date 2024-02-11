import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const customRolesManager = require("../../../../roles/custom-roles-manager");

const model : ReplaceVariable = {
    definition: {
        handle: "customRoleUsers",
        usage: "customRoleUsers[role]",
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

export default model;