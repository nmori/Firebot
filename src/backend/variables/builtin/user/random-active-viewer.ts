import type { ReplaceVariable } from "../../../../types/variables";
import { ActiveUserHandler } from '../../../chat/active-user-handler';
import customRolesManager from '../../../roles/custom-roles-manager';
import logger from "../../../logwrapper";
import { getRandomInt } from '../../../utils';

const model : ReplaceVariable = {
    definition: {
        handle: "randomActiveViewer",
        usage: "randomActiveViewer",
        description: "アクティブなチャッターのユーザー名をランダムに取得します。",
        examples: [
            {
                usage: "randomActiveViewer[customRolesToInclude, usersToExclude, customRolesToExclude, username|id|raw]",
                description: "指定したカスタムロールに属するアクティブチャッターをランダムに取得します　2引数以降で除外ユーザーや除外ロールを指定できます。"
            },
            {
                usage: "randomActiveViewer[roleName]",
                description: "指定のロールに属するアクティブ視聴者に絞り込みます。"
            },
            {
                usage: "randomActiveViewer[null, ignoreUser]",
                description: "指定したユーザーを除くランダムなアクティブユーザーを取得します。"
            },
            {
                usage: "randomActiveViewer[$arrayFrom[roleOne, roleTwo], $arrayFrom[$streamer, $bot], $arrayFrom[roleC, roleD]]",
                description: "roleOne または roleTwo のメンバーに絞り込み、ストリーマー・ボットおよび roleC・ roleD のメンバーを除外します。"
            },
            {
                usage: "randomActiveViewer[null, null, null, id]",
                description: "ランダムなアクティブチャッターのユニークユーザー ID を取得します。"
            },
            {
                usage: "randomActiveViewer[null, null, null, raw]",
                description: "ランダムなアクティブチャッターをオブジェクト形式で取得します（`username` と `id` プロパティを含む）。"
            }
        ],
        categories: ["user based"],
        possibleDataOutput: ["text", "object"]
    },
    evaluator: (_trigger, roles?: string | string[], ignoreUsers?: string | string[], ignoreRoles?: string | string[], propName?: string) => {
        const failResult = "[Unable to get random active user]";
        logger.debug("Getting random active viewer...");

        const activeViewerCount = ActiveUserHandler.getActiveUserCount();
        if (activeViewerCount === 0) {
            logger.debug("randomActiveViewer: no active viewers are available to select from");
            return failResult;
        }

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

        const excludedUserNames = parseArg(ignoreUsers);
        const excludedRoleNames = parseArg(ignoreRoles);
        const includedRoleNames = parseArg(roles);

        const excludedRoles = excludedRoleNames
            .map(roleName => customRolesManager.getRoleByName(roleName))
            .filter(role => role != null);
        const includedRoles = includedRoleNames
            .map(roleName => customRolesManager.getRoleByName(roleName))
            .filter(role => role != null && !excludedRoles.some(er => er.id === role.id));

        if (includedRoleNames.length > includedRoles.length) {
            const unkOrExcRoleNames = includedRoleNames
                .filter(roleName => !includedRoles.some(role => role.name.toLowerCase() === roleName?.toLowerCase()))
                .join(", ");

            // warn and return early if /all/ included roles are unknown or excluded
            if (includedRoles.length === 0) {
                logger.warn(`randomActiveViewer filtering solely to unknown or excluded role(s): ${unkOrExcRoleNames}`);
                return failResult;
            }
            // otherwise, warn if any roles are unknown
            logger.warn(`randomActiveViewer ignoring unknown or also-excluded role(s): ${unkOrExcRoleNames}`);
        }

        if (excludedRoleNames.length > excludedRoles.length) {
            const unknownRoleNames = excludedRoleNames
                .filter(roleName => !excludedRoles.some(role => role.name.toLowerCase() === roleName.toLowerCase()));
            logger.warn(`randomActiveViewer ignoring unknown excluded role(s): ${unknownRoleNames.join(", ")}`);
        }

        let selectableViewers = ActiveUserHandler.getAllActiveUsers();
        if (excludedUserNames.length > 0) {
            selectableViewers = selectableViewers.filter(user => !excludedUserNames.includes(user.username));
        }
        if (excludedRoles.length > 0) {
            const excludedRoleIds = excludedRoles.map(role => role.id);
            selectableViewers = selectableViewers.filter(user => !customRolesManager.userIsInRole(user.id, [], excludedRoleIds));
        }
        if (includedRoles.length > 0) {
            const includedRoleIds = includedRoles.map(role => role.id);
            selectableViewers = selectableViewers.filter(user => customRolesManager.userIsInRole(user.id, [], includedRoleIds));
        }

        if (selectableViewers.length > 0) {
            const randIndex = getRandomInt(0, selectableViewers.length - 1);
            switch (propName?.toLowerCase()) {
                case "id":
                    return selectableViewers[randIndex].id;
                case "raw":
                    return selectableViewers[randIndex];
                case "username":
                default:
                    return selectableViewers[randIndex].username;
            }
        }

        logger.warn(`randomActiveViewer failed to get a user; +${activeViewerCount}/-${
            excludedUserNames.length} viewers, +${includedRoles.length}/-${excludedRoles.length} roles`);
        return failResult;
    }
};

export default model;
