import type { ReplaceVariable } from "../../../../../types/variables";
import customRolesManager from "../../../../roles/custom-roles-manager";
import logger from "../../../../logwrapper";
import { getRandomInt } from "../../../../utils";

const model : ReplaceVariable = {
    definition: {
        handle: "randomCustomRoleUser",
        usage: "randomCustomRoleUser[role]",
        description: "指定したカスタムロールに属するランダムなユーザーの表示名を返します。",
        categories: ["user based"],
        possibleDataOutput: ["text", "object"],
        examples: [
            {
                usage: "randomCustomRoleUser[customRolesToInclude, usersToExclude, customRolesToExclude, displayName|username|id|raw]",
                description: "指定ロールのメンバーから除外ユーザー・除外ロールを考慮してランダムに取得します。"
            },
            {
                usage: "randomCustomRoleUser[roleOne, $streamer]",
                description: "roleOne のメンバーからストリーマーを除くランダムな表示名を取得します。"
            },
            {
                usage: "randomCustomRoleUser[roleOne, null, roleC, username]",
                description: "roleOne のメンバーから roleC のメンバーを除くランダムなユーザー名を取得します。"
            },
            {
                usage: "randomCustomRoleUser[$arrayFrom[roleOne, roleTwo], $arrayFrom[$streamer, $bot], $arrayFrom[roleC, roleD]]",
                description: "roleOne/roleTwo のメンバーからストリーマー・ボットおよび roleC/roleD のメンバーを除外します。"
            },
            {
                usage: "randomCustomRoleUser[roleOne, null, null, raw]",
                description: "roleOne のメンバーをオブジェクト形式で取得します（`displayName`、`username`、`id` プロパティを含む）。"
            }
        ]
    },
    evaluator: (_, roles: string | string[], ignoreUsers?: string | string[], ignoreRoles?: string | string[], propName?: string) => {
        function parseArg(param?: string | string[]): string[] {
            if (param != null) {
                if (Array.isArray(param)) {
                    return [...new Set(param.filter(p => p != null))]; // defensive de-duplication
                } else if (typeof param === "string" && param.toLowerCase() !== "null") {
                    return [param];
                }
            }
            return [];
        }

        const failResult: Readonly<{ noRoles: string, noUsers: string }> = {
            noRoles: "[No custom role specified]",
            noUsers: ""
        };

        const excludedUserNames = parseArg(ignoreUsers);
        const excludedRoleNames = parseArg(ignoreRoles);
        const includedRoleNames = parseArg(roles);

        if (includedRoleNames.length === 0) {
            logger.warn("randomCustomRoleUser: no custom roles specified");
            return failResult.noRoles;
        }

        const excludedRoles = excludedRoleNames
            .map(roleName => customRolesManager.getRoleByName(roleName))
            .filter(role => role != null);
        const includedRoles = includedRoleNames
            .map(roleName => customRolesManager.getRoleByName(roleName))
            .filter(role => role != null && !excludedRoles.some(er => er.id === role.id));

        if (includedRoles.length === 0) {
            logger.warn(`randomCustomRoleUser: filtering solely to unknown or excluded role(s): ${includedRoleNames.join(", ")}`);
            return failResult.noRoles;
        } else if (includedRoles.every(role => role.viewers.length === 0)) {
            logger.warn(`randomCustomRoleUser: all role(s) are empty: ${includedRoles.map(role => role.name).join(", ")}`);
            return failResult.noUsers;
        } else if (includedRoleNames.length > includedRoles.length) {
            const unknownRoleNames = includedRoleNames
                .filter(roleName => !includedRoles.some(role => role.name.toLowerCase() === roleName.toLowerCase()));
            logger.warn(`randomCustomRoleUser: ignoring unknown or also-excluded role(s): ${unknownRoleNames.join(", ")}`);
        }

        if (excludedRoleNames.length > excludedRoles.length) {
            const unknownRoleNames = excludedRoleNames
                .filter(roleName => !excludedRoles.some(role => role.name.toLowerCase() === roleName.toLowerCase()));
            logger.warn(`randomCustomRoleUser: ignoring unknown excluded role(s): ${unknownRoleNames.join(", ")}`);
        }

        let selectableUsers = includedRoles.flatMap(role => role.viewers).filter((user, idx, arr) => {
            return arr.findIndex(u => u.id === user.id) === idx;
        });
        if (excludedUserNames.length > 0) {
            selectableUsers = selectableUsers.filter(user => !excludedUserNames.includes(user.username));
        }
        if (excludedRoles.length > 0) {
            const excludedRoleIds = excludedRoles.map(role => role.id);
            selectableUsers = selectableUsers.filter(user => !customRolesManager.userIsInRole(user.id, [], excludedRoleIds));
        }

        if (selectableUsers.length > 0) {
            const randIndex = getRandomInt(0, selectableUsers.length - 1);
            switch (propName?.toLowerCase()) {
                case "id":
                    return selectableUsers[randIndex].id;
                case "raw":
                    return selectableUsers[randIndex];
                case "username":
                    return selectableUsers[randIndex].username;
                // Back-compat; *should* ideally default to username
                default:
                case "displayname":
                    return selectableUsers[randIndex].displayName;
            }
        }

        logger.warn(`randomCustomRoleUser: failed to get a user; +${includedRoles.length}/-${
            excludedRoles.length} roles, -${excludedUserNames.length} users`);
        return failResult.noUsers;
    }
};

export default model;