import { SystemCommand } from "../../../../types/commands";
import customRoleManager from "../../../roles/custom-roles-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

/**
 * The `!role` command
 */
export const CustomRoleManagementSystemCommand: SystemCommand = {
    definition: {
        id: "firebot:role-management",
        name: "カスタムロール管理",
        active: true,
        trigger: "!role",
        description: "チャットから視聴者のカスタムロールを管理できます。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        restrictionData: {
            restrictions: [
                {
                    id: "sys-cmd-mods-only-perms",
                    type: "firebot:permissions",
                    mode: "roles",
                    roleIds: [
                        "broadcaster"
                    ]
                }
            ]
        },
        subCommands: [
            {
                arg: "add",
                usage: "add @視聴者 ロール名",
                description: "視聴者にカスタムロールを追加します。",
                minArgs: 3
            },
            {
                arg: "remove",
                usage: "remove @視聴者 ロール名",
                description: "視聴者からカスタムロールを削除します。",
                minArgs: 3
            },
            {
                arg: "list",
                usage: "list [@視聴者]",
                description: "すべてのカスタムロール、または視聴者が持っているロールのみを一覧表示します。"
            }
        ]
    },
    onTriggerEvent: async (event) => {

        const { args, triggeredArg } = event.userCommand;

        if (args.length < 1) {
            await TwitchApi.chat.sendChatMessage("コマンドの使い方が間違っています！", null, true);
            return;
        }

        switch (triggeredArg) {
            case "add": {
                const roleName = args.slice(2)[0];
                const role = customRoleManager.getRoleByName(roleName);
                if (role == null) {
                    await TwitchApi.chat.sendChatMessage("その名前のロールが見つかりません。", null, true);
                } else {
                    const username = args[1].replace("@", "");
                    const user = await TwitchApi.users.getUserByName(username);
                    if (user == null) {
                        await TwitchApi.chat.sendChatMessage(`${username} にロール ${role.name} を追加できませんでした。ユーザーが存在しません。`, null, true);
                    } else {
                        customRoleManager.addViewerToRole(role.id, {
                            id: user.id,
                            username: user.name,
                            displayName: user.displayName
                        });
                        await TwitchApi.chat.sendChatMessage(`${username} にロール ${role.name} を追加しました。`, null, true);
                    }
                }
                break;
            }
            case "remove": {
                const roleName = args.slice(2)[0];
                const role = customRoleManager.getRoleByName(roleName);
                if (role == null) {
                    await TwitchApi.chat.sendChatMessage("その名前のロールが見つかりません。", null, true);
                } else {
                    const username = args[1].replace("@", "");
                    const user = await TwitchApi.users.getUserByName(username);
                    if (user == null) {
                        await TwitchApi.chat.sendChatMessage(`${username} からロール ${role.name} を削除できませんでした。ユーザーが存在しません。`, null, true);
                    } else {
                        customRoleManager.removeViewerFromRole(role.id, user.id);
                        await TwitchApi.chat.sendChatMessage(`${username} からロール ${role.name} を削除しました。`, null, true);
                    }
                }
                break;
            }
            case "list": {
                if (args.length > 1) {
                    const username = args[1].replace("@", "");
                    const user = await TwitchApi.users.getUserByName(username);
                    if (user == null) {
                        await TwitchApi.chat.sendChatMessage(`${username} のロールを取得できませんでした。ユーザーが存在しません。`, null, true);
                    } else {
                        const roleNames = customRoleManager.getAllCustomRolesForViewer(user.id).map(r => r.name);
                        if (roleNames.length < 1) {
                            await TwitchApi.chat.sendChatMessage(`${username} にはカスタムロールが割り当てられていません。`, null, true);
                        } else {
                            await TwitchApi.chat.sendChatMessage(`${username} のカスタムロール： ${roleNames.join(", ")}`, null, true);
                        }
                    }

                } else {
                    const roleNames = customRoleManager.getCustomRoles().map(r => r.name);
                    if (roleNames.length < 1) {
                        await TwitchApi.chat.sendChatMessage(`利用可能なカスタムロールはありません。`, null, true);
                    } else {
                        await TwitchApi.chat.sendChatMessage(`利用可能なカスタムロール： ${roleNames.join(", ")}`, null, true);
                    }
                }
                break;
            }
            default:
                await TwitchApi.chat.sendChatMessage("コマンドの使い方が間違っています！", null, true);
        }
    }
};