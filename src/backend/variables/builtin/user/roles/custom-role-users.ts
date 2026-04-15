import type { ReplaceVariable } from "../../../../../types/variables";
import customRolesManager from "../../../../roles/custom-roles-manager";

const model : ReplaceVariable = {
    definition: {
        handle: "customRoleUsers",
        usage: "customRoleUsers[role]",
        description: "指定したカスタムロールの全ユーザー表示名の配列を返します。",
        categories: ["user based"],
        possibleDataOutput: ["array"],
        examples: [
            {
                usage: "customRoleUsers[role, username]",
                description: "指定したカスタムロールの全ユーザー名（表示名でなくユーザー名）の配列を返します。"
            },
            {
                usage: "customRoleUsers[role, raw]",
                description: "指定したカスタムロールのユーザーオブジェクト（`displayName`、`id`、`username` プロパティを含む）の配列を返します。"
            }
        ]
    },
    evaluator: (_, role: string, propertyName?: string) => {
        if (role == null || role === '') {
            return [];
        }

        const customRole = customRolesManager.getRoleByName(role);

        if (propertyName?.toLowerCase() === "username") {
            return customRole?.viewers?.map(v => v.username) || [];
        } else if (propertyName?.toLowerCase() === "raw") {
            return customRole?.viewers || [];
        }

        return customRole?.viewers?.map(v => v.displayName) || [];
    }
};

export default model;
