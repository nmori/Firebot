"use strict";

const uuidv1 = require("uuid/v1");
const util = require("../../../utility");
const frontendCommunicator = require("../../../common/frontend-communicator");
const customRolesManager = require("../../../roles/custom-roles-manager");
const teamRolesManager = require("../../../roles/team-roles-manager");

function seperateTriggerFromArgs(args) {
    let trigger, remainingData = "";
    if (args[1].startsWith("\"")) {
        const combined = args.slice(1).join(" ");
        const quotedTriggerRegex = /(?<=(?:\s|^)")(?:[^"]|(?:\\"))*(?=(?:(?:"(?<!\\"))(?:\s|$)))/i;
        const results = quotedTriggerRegex.exec(combined);

        if (results === null) {
            trigger = args[1];
            remainingData = args.slice(2).join(" ").trim();
        } else {
            trigger = results[0].trim();
            remainingData = combined.replace(`"${trigger}"`, "").trim();
        }
    } else {
        trigger = args[1];
        remainingData = args.slice(2).join(" ").trim();
    }
    return {
        trigger: trigger,
        remainingData: remainingData
    };
}

const mapSingleRole = async (perm) => {
    const groups = [];

    const roles = [
        ...customRolesManager.getCustomRoles(),
        ...await teamRolesManager.getTeamRoles()
    ];

    const role = roles.find(r => r.name.toLowerCase() === perm);
    if (role) {
        groups.push(role.id);
        return groups;
    }

    switch (perm) {
        case "all":
        case "everyone":
            break;
        case "sub":
            groups.push("sub");
        case "vip": //eslint-disable-line no-fallthrough
            groups.push("vip");
        case "mod": //eslint-disable-line no-fallthrough
            groups.push("mod");
        case "streamer": //eslint-disable-line no-fallthrough
            groups.push("broadcaster");
            break;
    }

    return groups;
};

const mapMultipleRoles = async (permArray) => {
    const groups = [];

    const roles = [
        ...customRolesManager.getCustomRoles(),
        ...await teamRolesManager.getTeamRoles()
    ];

    for (let perm of permArray) {
        perm = perm.trim();

        const role = roles.find(r => r.name.toLowerCase() === perm);
        if (role) {
            groups.push(role.id);
            continue;
        }

        switch (perm) {
            case "all":
            case "everyone":
                break;
            case "sub":
                groups.push("sub");
                break;
            case "vip":
                groups.push("vip");
                break;
            case "mod":
                groups.push("mod");
                break;
            case "streamer":
                groups.push("broadcaster");
                break;
        }
    }

    return groups;
};

const mapPermArgToRoleIds = async (permArg) => {
    if (permArg == null || permArg === "") {
        return [];
    }

    const normalizedPerm = permArg.toLowerCase().trim();
    let groups = [];

    if (normalizedPerm.includes(",")) {
        groups = await mapMultipleRoles(normalizedPerm.split(","));
    } else {
        groups = await mapSingleRole(normalizedPerm);
    }

    return groups;
};

/**
 * The Command List command
 */
const commandManagement = {
    definition: {
        id: "firebot:commandmanagement",
        name: "Command Management",
        active: true,
        trigger: "!command",
        description: "�`���b�g�ɂ��R�}���h�Ǘ�������",
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
                        "broadcaster",
                        "mod"
                    ]
                }
            ]
        },
        subCommands: [
            {
                arg: "add",
                usage: "add [!trigger or \"phrase\"] [message]",
                description: "�w�肳�ꂽ�������b�Z�[�W���܂ސV�����R�}���h��ǉ�."
            },
            {
                arg: "response",
                usage: "response [!trigger or \"phrase\"] [message]",
                description: "�R�}���h�̉������b�Z�[�W���X�V�i�`���b�g���o�� 1 �ȉ��̃R�}���h�̂ݗL���j"
            },
            {
                arg: "setcount",
                usage: "setcount [!trigger or \"phrase\"] count#",
                description: "�R�}���h�̎g�p�񐔂��X�V",
                minArgs: 3
            },
            {
                arg: "cooldown",
                usage: "cooldown [!trigger or \"phrase\"] [globalCooldownSecs] [userCooldownSecs]",
                description: "�R�}���h���Ď��s�\�ɂȂ�܂ł̎��Ԃ�ύX"
            },
            {
                arg: "restrict",
                usage: "restrict [!trigger or \"phrase\"] [All/Sub/Mod/Streamer/Custom Group]",
                description: "�R�}���h�̌������X�V"
            },
            {
                arg: "remove",
                usage: "remove [!trigger or \"phrase\"]",
                description: "�w�肳�ꂽ�R�}���h���폜."
            },
            {
                arg: "description",
                usage: "description [!trigger or \"phrase\"]",
                description: "�R�}���h�̐������X�V",
                minArgs: 3
            },
            {
                arg: "enable",
                usage: "enable [!trigger or \"phrase\"]",
                description: "�R�}���h��L����"
            },
            {
                arg: "disable",
                usage: "disable [!trigger or \"phrase\"]",
                description: "�R�}���h�𖳌���"
            },
            {
                arg: "addalias",
                usage: "addalias [!trigger or \"phrase\"] !alias",
                description: "�ʖ���ǉ�"
            },
            {
                arg: "removealias",
                usage: "removealias [!trigger or \"phrase\"] !alias",
                description: "�w�肳�ꂽ�ʖ����폜"
            }
        ]
    },
    /**
   * When the command is triggered
   */
    onTriggerEvent: event => {
        return new Promise(async (resolve) => {
            const commandManager = require("../CommandManager");
            const chat = require("../../twitch-chat");

            const activeCustomCommands = commandManager
                .getAllCustomCommands()
                .filter(c => c.active);

            const triggeredArg = event.userCommand.triggeredArg;

            //grab usage
            let usage = event.command.usage ? event.command.usage : "";
            if (triggeredArg != null) {
                const subCommand = event.command.subCommands.find(
                    sc => sc.arg === triggeredArg
                );
                if (subCommand != null) {
                    usage = subCommand.usage;
                }
            }

            const args = event.userCommand.args;

            if (args.length < 2) {
                await chat.sendChatMessage(
                    `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`);
                return resolve();
            }

            const { trigger, remainingData } = seperateTriggerFromArgs(args);

            if (trigger == null || trigger === "") {
                await chat.sendChatMessage(
                    `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                );
                return resolve();
            }

            switch (triggeredArg) {
            case "add": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                if (commandManager.triggerIsTaken(trigger)) {
                    await chat.sendChatMessage(
                        `�N���� '${trigger}' �͂��łɎg���Ă��܂��B`
                    );
                    return resolve();
                    }

                    const command = {
                        trigger: trigger,
                        autoDeleteTrigger: false,
                        ignoreBot: true,
                        active: true,
                        scanWholeMessage: !trigger.startsWith("!"),
                        cooldown: {
                            user: 0,
                            global: 0
                        },
                        effects: {
                            id: uuidv1(),
                            list: [
                                {
                                    id: uuidv1(),
                                    type: "firebot:chat",
                                    message: remainingData
                                }
                            ]
                        }
                    };

                await chat.sendChatMessage(
                    `�R�}���h '${trigger}' ��ǉ����܂���`
                );

                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        ` '${trigger}'�͌�����܂���`
                    );
                    return resolve();
                }
                case "response": {
                    if (args.length < 3 || remainingData == null || remainingData === "") {
                        await chat.sendChatMessage(
                            `Invalid command. Usage: ${event.command.trigger} ${usage}`
                        );
                        return resolve();
                    }

                    const command = activeCustomCommands.find(c => c.trigger === trigger);
                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    const chatEffectsCount = command.effects ? command.effects.list.filter(e => e.type === "firebot:chat").length : 0;
                if (chatEffectsCount > 1) {
                    await chat.sendChatMessage(
                        `�R�}���h�� '${trigger}' �� ���o�������ݒ肳��Ă��邽�߁A�`���b�g����͕ҏW�ł��܂���`
                    );
                    return resolve();
                }
                if (chatEffectsCount === 1) {
                    const chatEffect = command.effects.list.find(e => e.type === "firebot:chat");
                    chatEffect.message = remainingData;
                } else {
                    const chatEffect = {
                        id: uuidv1(),
                        type: "firebot:chat",
                        message: remainingData
                    };
                    command.effects.list.push(chatEffect);
                }

                    if (chatEffectsCount > 1) {
                        await chat.sendChatMessage(
                            `The command '${trigger}' has more than one Chat Effect, preventing the response from being editable via chat.`
                        );
                        return resolve();
                    }
                    if (chatEffectsCount === 1) {
                        const chatEffect = command.effects.list.find(e => e.type === "firebot:chat");
                        chatEffect.message = remainingData;
                    } else {
                        const chatEffect = {
                            id: uuidv1(),
                            type: "firebot:chat",
                            message: remainingData
                        };
                        command.effects.list.push(chatEffect);
                    }

                await chat.sendChatMessage(
                    `'${trigger}' �̉������X�V���܂���: ${remainingData}`
                );

                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'�͌�����܂���`
                    );
                    return resolve();
                }
                case "setcount": {
                    const countArg = remainingData.trim();
                    if (countArg === "" || isNaN(countArg)) {
                        await chat.sendChatMessage(
                            `Invalid command. Usage: ${event.command.trigger} ${usage}`
                        );
                        return resolve();
                    }

                    const command = activeCustomCommands.find(c => c.trigger === trigger);
                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    let newCount = parseInt(countArg);
                    if (newCount < 0) {
                        newCount = 0;
                    }

                    command.count = parseInt(newCount);

                await chat.sendChatMessage(
                    ` '${trigger}' �̎g�p�񐔂�${newCount}��ɐݒ肵�܂���`
                );
                    commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                    await chat.sendChatMessage(
                        `'${trigger}'�͌�����܂���`
                    );

                if (remainingData == null || remainingData.length < 1) {
                    await chat.sendChatMessage(
                        ` '${trigger}' �ɕt���Ă̊T�v��񋟂��Ă�������`
                    );
                    return resolve();
                }
                case "description": {

                    const command = activeCustomCommands.find(c => c.trigger === trigger);
                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    if (remainingData == null || remainingData.length < 1) {
                        await chat.sendChatMessage(
                            `Please provided a description for '${trigger}'!`
                        );
                        return resolve();
                    }

                await chat.sendChatMessage(
                    ` '${trigger}' �̊T�v�����̒l�ɂ��܂����F ${remainingData}`
                );

                    commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'�͌�����܂���`
                    );
                    return resolve();
                }
                case "cooldown": {
                    const cooldownArgs = remainingData.trim().split(" ");
                    if (args.length < 3 || remainingData === "" || cooldownArgs.length < 2 || isNaN(cooldownArgs[0])
                    || isNaN(cooldownArgs[1])) {
                        await chat.sendChatMessage(
                            `Invalid command. Usage: ${event.command.trigger} ${usage}`
                        );
                        return resolve();
                    }

                    const command = activeCustomCommands.find(c => c.trigger === trigger);
                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    let globalCooldown = parseInt(cooldownArgs[0]),
                        userCooldown = parseInt(cooldownArgs[1]);

                    if (globalCooldown < 0) {
                        globalCooldown = 0;
                    }

                    if (userCooldown < 0) {
                        userCooldown = 0;
                    }

                    command.cooldown = {
                        user: userCooldown,
                        global: globalCooldown
                    };

                await chat.sendChatMessage(
                    `'${trigger}' �̃N���[�_�E���ݒ���X�V���܂���: ${userCooldown}�b (���[�U), ${globalCooldown}�b (�S��)`
                );

                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'�͌�����܂���`
                    );
                    return resolve();
                }
                case "restrict": {
                    if (args.length < 3 || remainingData === "") {
                        await chat.sendChatMessage(
                            `Invalid command. Usage: ${event.command.trigger} ${usage}`
                        );
                        return resolve();
                    }

                    const command = activeCustomCommands.find(c => c.trigger === trigger);
                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    const restrictions = [];
                    const roleIds = await mapPermArgToRoleIds(remainingData);

                if (roleIds === false) {
                    await chat.sendChatMessage(
                        `�L���Ȑݒ�l���w�肵�Ă�������: All, Sub, Mod, Streamer,�������̓O���[�v��`
                    );
                    return resolve();
                }

                    if (roleIds === false) {
                        await chat.sendChatMessage(
                            `Please provide a valid group name: All, Sub, Mod, Streamer, or a custom group's name`
                        );
                        return resolve();
                    }

                    if (roleIds != null) {
                        restrictions.push({
                            id: uuidv1(),
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: roleIds
                        });
                    }

                    command.restrictionData = { restrictions: restrictions };

                await chat.sendChatMessage(`'${trigger}' �̐����ݒ���X�V: ${remainingData}`);

                    await chat.sendChatMessage(`Updated '${trigger}' restrictions to: ${remainingData}`);

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'�͌�����܂���`
                    );
                    return resolve();
                }
                case "remove": {

                    const command = activeCustomCommands.find(c => c.trigger === trigger);
                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    commandManager.removeCustomCommandByTrigger(trigger);

                    await chat.sendChatMessage(`Successfully removed command '${trigger}'.`);
                    break;
                }
                case "disable":
                case "enable": {
                    const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                if (command.active === newActiveStatus) {
                    await chat.sendChatMessage(
                        `${trigger} �͂��łɎ��̒l�ɐݒ肳��Ă��܂��F ${triggeredArg}`
                    );
                    return resolve();
                }

                    if (command.active === newActiveStatus) {
                        await chat.sendChatMessage(
                            `${trigger} is already ${triggeredArg}d.`
                        );
                        return resolve();
                    }

                    command.active = newActiveStatus;

                    commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                    frontendCommunicator.send("custom-commands-updated");

                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );
                    break;
                }
                case "addalias": {
                    const alias = remainingData.trim();

                    if (args.length < 3 || alias === "") {
                        await chat.sendChatMessage(
                            `Invalid command. Usage: ${event.command.trigger} ${usage}`
                        );
                        return resolve();
                    }

                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'�͌�����܂���`
                    );
                    return resolve();
                }

                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                    const aliasIndex = command.aliases.findIndex((a) =>
                        a.toLowerCase() === alias.toLowerCase());

                    if (aliasIndex > -1) {
                        await chat.sendChatMessage(
                            `Alias '${alias}' already exists for command with the trigger '${trigger}'.`
                        );
                        return resolve();
                    }

                    command.aliases.push(alias);
                    commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                    await chat.sendChatMessage(
                        `'${trigger}'���g���ʖ�'${alias}' �͂��łɑ��݂��܂�.`
                    );

                    break;
                }
                case "removealias": {
                    const alias = remainingData.trim();

                    if (args.length < 3 || alias === "") {
                        await chat.sendChatMessage(
                            `Invalid command. Usage: ${event.command.trigger} ${usage}`
                        );
                        return resolve();
                    }

                await chat.sendChatMessage(
                    `'${trigger}'�̕ʖ��Ƃ��� '${alias}' ��ǉ����܂���`
                );

                    if (command == null) {
                        await chat.sendChatMessage(
                            `Could not find a command with the trigger '${trigger}', please try again.`
                        );
                        return resolve();
                    }

                if (args.length < 3 || alias === "") {
                    await chat.sendChatMessage(
                        `�����Ȗ���. �g�p���@: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                    if (aliasIndex === -1) {
                        await chat.sendChatMessage(
                            `Alias '${alias}' does not exist for command with the trigger '${trigger}'.`
                        );
                        return resolve();
                    }

                    command.aliases.splice(aliasIndex, 1);
                    commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                    await chat.sendChatMessage(
                        `'${trigger}' �͌�����܂���`
                    );

                const aliasIndex = command.aliases.findIndex((a) =>
                    a.toLowerCase() === alias.toLowerCase());

                if (aliasIndex === -1) {
                    await chat.sendChatMessage(
                        `'${trigger}'�̕ʖ� '${alias}' �͑��݂��܂���`
                    );
                    return resolve();
                    break;
                }

                command.aliases.splice(aliasIndex, 1);
                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await chat.sendChatMessage(
                    `'${trigger}'�̕ʖ� ${alias}' ���폜���܂���`
                );

                break;
            }

            resolve();
        });
    }
};

module.exports = commandManagement;
