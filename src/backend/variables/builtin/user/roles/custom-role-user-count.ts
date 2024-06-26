import { ReplaceVariable } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const customRolesManager = require("../../../../roles/custom-roles-manager");

const model : ReplaceVariable = {
    definition: {
        handle: "customRoleUserCount",
        description: "役割に属している人数を取得します。",
        usage: "customRoleUserCount[role]",
        categories: [VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: async (trigger, roleName) => {
        if (roleName == null || roleName == null) {
            return 0;
        }

        const customRole = customRolesManager.getRoleByName(roleName);

        if (customRole !== null) {
            return customRole.viewers.length;
        }

        return 0;
    }
};

export default model;
