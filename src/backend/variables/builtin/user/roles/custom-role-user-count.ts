import type { ReplaceVariable } from "../../../../../types/variables";
import customRolesManager from "../../../../roles/custom-roles-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "customRoleUserCount",
        description: "指定したカスタムロールのメンバー数を取得します。",
        usage: "customRoleUserCount[role]",
        categories: ["numbers"],
        possibleDataOutput: ["number"]
    },
    evaluator: (trigger, roleName: string) => {
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
