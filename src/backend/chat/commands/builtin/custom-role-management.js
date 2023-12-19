"use strict";

const customRoleManager = require("../../../roles/custom-roles-manager");
const chat = require("../../twitch-chat");

const model = {
    definition: {
        id: "firebot:role-management",
        name: "役割を管理",
        active: true,
        trigger: "!role",
        description: "チャットから視聴者の役割を管理できるようにする",
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
                usage: "add @viewer roleName",
                description: "視聴者の役割を追加付与する",
                minArgs: 3
            },
            {
                arg: "remove",
                usage: "remove @viewer roleName",
                description: "視聴者の役割を外す",
                minArgs: 3
            },
            {
                arg: "list",
                usage: "list [@viewer]",
                description: "視聴者の役割をリスト表示する"
            }
        ]
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: async event => {

        const { args, triggeredArg } = event.userCommand;

        if (args.length < 1) {
            await chat.sendChatMessage("コマンドの使い方が正しくありません");
            return;
        }

        switch (triggeredArg) {
        case "add": {
            const roleName = args.slice(2);
            const role = customRoleManager.getRoleByName(roleName);
            if (role == null) {
                await chat.sendChatMessage("その役割名はみつかりません");
            } else {
                const username = args[1].replace("@", "");
                customRoleManager.addViewerToRole(role.id, username);
                await chat.sendChatMessage(`${username} に役割 ${role.name} を付与しました `);
            }
            break;
        }
        case "remove": {
            const roleName = args.slice(2);
            const role = customRoleManager.getRoleByName(roleName);
            if (role == null) {
                await chat.sendChatMessage("その役割名はみつかりません");
            } else {
                const username = args[1].replace("@", "");
                customRoleManager.removeViewerFromRole(role.id, username);
                await chat.sendChatMessage(`${username} の役割 ${role.name} を外しました`);
            }
            break;
        }
        case "list": {
            if (args.length > 1) {
                const username = args[1].replace("@", "");
                const roleNames = customRoleManager.getAllCustomRolesForViewer(username).map(r => r.name);
                if (roleNames.length < 1) {
                    await chat.sendChatMessage(`${username} には役割が付与されていません`);
                } else {
                    await chat.sendChatMessage(`${username}' の役割: ${roleNames.join(", ")}`);
                }

            } else {
                const roleNames = customRoleManager.getCustomRoles().map(r => r.name);
                if (roleNames.length < 1) {
                    await chat.sendChatMessage(`役割の割当はありません`);
                } else {
                    await chat.sendChatMessage(`利用可能な役割名: ${roleNames.join(", ")}`);
                }
            }
            break;
        }
        default:
            await chat.sendChatMessage("コマンドの使い方が正しくありません");
        }
    }
};

module.exports = model;
