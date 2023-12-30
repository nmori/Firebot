"use strict";

const customRoleManager = require("../../../roles/custom-roles-manager");
const chat = require("../../twitch-chat");

const model = {
    definition: {
        id: "firebot:role-management",
        name: "Custom Role Management",
        active: true,
        trigger: "!role",
        description: "�`���b�g���王���҂̖������Ǘ��ł���悤�ɂ���",
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
                description: "�����҂̖�����ǉ��t�^����",
                minArgs: 3
            },
            {
                arg: "remove",
                usage: "remove @viewer roleName",
                description: "�����҂̖������O��",
                minArgs: 3
            },
            {
                arg: "list",
                usage: "list [@viewer]",
                description: "�����҂̖��������X�g�\������"
            }
        ]
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: async event => {

        const { args, triggeredArg } = event.userCommand;

        if (args.length < 1) {
            await chat.sendChatMessage("�R�}���h�̎g����������������܂���");
            return;
        }

        switch (triggeredArg) {
        case "add": {
            const roleName = args.slice(2);
            const role = customRoleManager.getRoleByName(roleName);
            if (role == null) {
                await chat.sendChatMessage("���̖������݂͂���܂���");
            } else {
                const username = args[1].replace("@", "");
                customRoleManager.addViewerToRole(role.id, username);
                await chat.sendChatMessage(`${username} �ɖ��� ${role.name} ��t�^���܂��� `);
            }
            case "remove": {
                const roleName = args.slice(2);
                const role = customRoleManager.getRoleByName(roleName);
                if (role == null) {
                    await chat.sendChatMessage("Can't find a role by that name.");
                } else {
                    const username = args[1].replace("@", "");
                    customRoleManager.removeViewerFromRole(role.id, username);
                    await chat.sendChatMessage(`Removed role ${role.name} from ${username}`);
                }
                break;
            }
            case "list": {
                if (args.length > 1) {
                    const username = args[1].replace("@", "");
                    const roleNames = customRoleManager.getAllCustomRolesForViewer(username).map(r => r.name);
                    if (roleNames.length < 1) {
                        await chat.sendChatMessage(`${username} has no custom roles assigned.`);
                    } else {
                        await chat.sendChatMessage(`${username}'s custom roles: ${roleNames.join(", ")}`);
                    }

                } else {
                    const roleNames = customRoleManager.getCustomRoles().map(r => r.name);
                    if (roleNames.length < 1) {
                        await chat.sendChatMessage(`There are no custom roles available.`);
                    } else {
                        await chat.sendChatMessage(`Available custom roles: ${roleNames.join(", ")}`);
                    }
                }
                break;
            }
            default:
                await chat.sendChatMessage("Incorrect command usage!");
        }
        default:
            await chat.sendChatMessage("�R�}���h�̎g����������������܂���");
        }
    }
};

module.exports = model;
