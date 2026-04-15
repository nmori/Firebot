import type { ReplaceVariable } from "../../../../types/variables";
import { ActiveUserHandler } from "../../../chat/active-user-handler";
import customRolesManager from "../../../roles/custom-roles-manager";
import logger from "../../../logwrapper";
import { getRandomInt } from "../../../utils";

const model : ReplaceVariable = {
    definition: {
        handle: "randomViewer",
        description: "チャンネルのチャットに現在いるランダムな視聴者のユーザー名を取得します。",
        categories: ["user based"],
        possibleDataOutput: ["text", "object"],
        examples: [
            {
                usage: "randomViewer[customRolesToInclude, usersToExclude, customRolesToExclude, username|displayName|id|raw]",
                description: "指定したカスタムロールのメンバーからランダムな在線視聴者を取得します（除外ユーザー・ロールも指定可）。"
            },
            {
                usage: "randomViewer[roleOne, $streamer, null, displayName]",
                description: "roleOne のメンバーからストリーマーを除くランダム視聴者の表示名を取得します。"
            },
            {
                usage: "randomViewer[null, ebiggz, roleC, id]",
                description: "ebiggz と roleC のメンバーを除くランダム視聴者のユーザー ID を取得します。"
            },
            {
                usage: "randomViewer[$arrayFrom[roleOne, roleTwo], $arrayFrom[$streamer, $bot], $arrayFrom[roleC, roleD]]",
                description: "roleOne/roleTwo のメンバーに絞り込み、ストリーマー・ボットおよび roleC/roleD のメンバーを除外します。"
            },
            {
                usage: "randomViewer[null, null, null, raw]",
                description: "在線視聴者をオブジェクト形式で取得します（`username`、`displayName`、`id` プロパティを含む）。"
            }
        ]
    },
    evaluator: (_, roles?: string | string[], ignoreUsers?: string | string[], ignoreRoles?: string | string[], propName?: string) => {
        const failResult = "[Unable to get random viewer]";
        logger.debug("Getting random viewer...");

        const onlineViewerCount = ActiveUserHandler.getOnlineUserCount();

        if (onlineViewerCount === 0) {
            logger.warn("randomViewer: no online viewers are available to select from");
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
            // If user asked for a member of solely unknown/excluded roles, honor that.
            const isFatal = includedRoles.length === 0;
            const desc = isFatal ? "all included role(s)" : "ignoring included role(s) that";
            const unkOrExclRoleNames = includedRoleNames
                .filter(roleName => !includedRoles.some(role => role.name.toLowerCase() === roleName.toLowerCase()));

            logger.warn(`randomViewer ${desc} are unknown, or are also excluded: ${unkOrExclRoleNames.join(", ")}`);

            if (isFatal) {
                return failResult;
            }
        }

        if (excludedRoleNames.length > excludedRoles.length) {
            const unknownRoleNames = excludedRoleNames
                .filter(roleName => !excludedRoles.some(role => role.name.toLowerCase() === roleName.toLowerCase()));
            logger.warn(`randomViewer ignoring unknown excluded role(s): ${unknownRoleNames.join(", ")}`);
        }

        let selectableUsers = ActiveUserHandler.getAllOnlineUsers();
        if (excludedUserNames.length > 0) {
            selectableUsers = selectableUsers.filter(user => !excludedUserNames.includes(user.username));
        }
        if (excludedRoles.length > 0) {
            const excludedRoleIds = excludedRoles.map(role => role.id);
            selectableUsers = selectableUsers.filter(user => !customRolesManager.userIsInRole(user.id, [], excludedRoleIds));
        }
        if (includedRoles.length > 0) {
            const includedRoleIds = includedRoles.map(role => role.id);
            selectableUsers = selectableUsers.filter(user => customRolesManager.userIsInRole(user.id, [], includedRoleIds));
        }

        if (selectableUsers.length > 0) {
            const randIndex = getRandomInt(0, selectableUsers.length - 1);
            const winner = selectableUsers[randIndex];
            switch (propName?.toLowerCase()) {
                case "displayname":
                    return winner.displayName;
                case "id":
                    return winner.id;
                case "raw":
                    return {
                        displayName: winner.displayName,
                        id: winner.id,
                        username: winner.username
                    };
                default:
                case "username":
                    return winner.username;
            }
        }

        logger.warn(`randomViewer failed to get a user; +${onlineViewerCount}/-${
            excludedUserNames.length} viewers, +${includedRoles.length}/-${excludedRoles.length} roles`);
        return failResult;
    }
};

export default model;
