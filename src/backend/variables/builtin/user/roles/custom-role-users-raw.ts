import type { ReplaceVariable } from "../../../../../types/variables";

import customRoleUsers from './custom-role-users';

const model : ReplaceVariable = {
    definition: {
        handle: "rawCustomRoleUsers",
        usage: "rawCustomRoleUsers[role]",
        description: "(非推奨: $customRoleUsers を使用してください) 指定したカスタムロールに属するすべてのユーザーの配列を返します。",
        categories: ["user based"],
        possibleDataOutput: ["array"],
        hidden: true
    },
    evaluator: customRoleUsers.evaluator
};

export default model;