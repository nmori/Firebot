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
        description: "チャットによるコマンド管理を許可",
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
                description: "指定された応答メッセージを含む新しいコマンドを追加."
            },
            {
                arg: "response",
                usage: "response [!trigger or \"phrase\"] [message]",
                description: "コマンドの応答メッセージを更新（チャット演出が 1 以下のコマンドのみ有効）"
            },
            {
                arg: "setcount",
                usage: "setcount [!trigger or \"phrase\"] count#",
                description: "コマンドの使用回数を更新",
                minArgs: 3
            },
            {
                arg: "cooldown",
                usage: "cooldown [!trigger or \"phrase\"] [globalCooldownSecs] [userCooldownSecs]",
                description: "コマンドのクールダウン時間を変更"
            },
            {
                arg: "restrict",
                usage: "restrict [!trigger or \"phrase\"] [All/Sub/Mod/Streamer/Custom Group]",
                description: "コマンドの権限を更新"
            },
            {
                arg: "remove",
                usage: "remove [!trigger or \"phrase\"]",
                description: "指定されたコマンドを削除."
            },
            {
                arg: "description",
                usage: "description [!trigger or \"phrase\"]",
                description: "コマンドの説明を更新",
                minArgs: 3
            },
            {
                arg: "enable",
                usage: "enable [!trigger or \"phrase\"]",
                description: "コマンドを有効化"
            },
            {
                arg: "disable",
                usage: "disable [!trigger or \"phrase\"]",
                description: "コマンドを無効化"
            },
            {
                arg: "addalias",
                usage: "addalias [!trigger or \"phrase\"] !alias",
                description: "別名を追加"
            },
            {
                arg: "removealias",
                usage: "removealias [!trigger or \"phrase\"] !alias",
                description: "指定された別名を削除"
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
                    `無効な命令. 使用方法: ${event.command.trigger} ${usage}`);
                return resolve();
            }

            const { trigger, remainingData } = seperateTriggerFromArgs(args);

            if (trigger == null || trigger === "") {
                await chat.sendChatMessage(
                    `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                );
                return resolve();
            }

            switch (triggeredArg) {
            case "add": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                if (commandManager.triggerIsTaken(trigger)) {
                    await chat.sendChatMessage(
                        `トリガー名 '${trigger}' はすでに使われています。`
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

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await chat.sendChatMessage(
                    `コマンド '${trigger}' を追加しました`
                );

                break;
            }
            case "response": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        ` '${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                const chatEffectsCount = command.effects ? command.effects.list.filter(e => e.type === "firebot:chat").length : 0;

                if (chatEffectsCount > 1) {
                    await chat.sendChatMessage(
                        `コマンド名 '${trigger}' は 演出が複数設定されているため、チャットからは編集できません`
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

                commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                await chat.sendChatMessage(
                    `'${trigger}' の応答を更新しました: ${remainingData}`
                );

                break;
            }
            case "setcount": {
                const countArg = remainingData.trim();
                if (countArg === "" || isNaN(countArg)) {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                let newCount = parseInt(countArg);
                if (newCount < 0) {
                    newCount = 0;
                }

                command.count = parseInt(newCount);

                commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                await chat.sendChatMessage(
                    ` '${trigger}' の使用回数を${newCount}回に設定しました`
                );

                break;
            }
            case "description": {

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                if (remainingData == null || remainingData.length < 1) {
                    await chat.sendChatMessage(
                        ` '${trigger}' に付いての概要を提供してください`
                    );
                    return resolve();
                }

                command.description = remainingData;

                commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                await chat.sendChatMessage(
                    ` '${trigger}' の概要を次の値にしました： ${remainingData}`
                );

                break;
            }
            case "cooldown": {
                const cooldownArgs = remainingData.trim().split(" ");
                if (args.length < 3 || remainingData === "" || cooldownArgs.length < 2 || isNaN(cooldownArgs[0])
                    || isNaN(cooldownArgs[1])) {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
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

                commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                await chat.sendChatMessage(
                    `'${trigger}' のクルーダウン設定を更新しました: ${userCooldown}秒 (ユーザ), ${globalCooldown}秒 (全体)`
                );

                break;
            }
            case "restrict": {
                if (args.length < 3 || remainingData === "") {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                const restrictions = [];
                const roleIds = await mapPermArgToRoleIds(remainingData);


                if (roleIds === false) {
                    await chat.sendChatMessage(
                        `有効な設定値を指定してください: All, Sub, Mod, Streamer,もしくはグループ名`
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

                commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                await chat.sendChatMessage(`'${trigger}' の制限設定を更新: ${remainingData}`);

                break;
            }
            case "remove": {

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                commandManager.removeCustomCommandByTrigger(trigger);

                await chat.sendChatMessage(`'${trigger}'を削除しました`);
                break;
            }
            case "disable":
            case "enable": {
                const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                const newActiveStatus = triggeredArg === "enable";

                if (command.active === newActiveStatus) {
                    await chat.sendChatMessage(
                        `${trigger} はすでに次の値に設定されています： ${triggeredArg}`
                    );
                    return resolve();
                }

                command.active = newActiveStatus;

                commandManager.saveCustomCommand(command, event.userCommand.commandSender, false);

                frontendCommunicator.send("custom-commands-updated");

                await chat.sendChatMessage(
                    `${util.capitalize(triggeredArg)}d "${trigger}"`
                );
                break;
            }
            case "addalias": {
                const alias = remainingData.trim();

                if (args.length < 3 || alias === "") {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}'は見つかりません`
                    );
                    return resolve();
                }

                const aliasIndex = command.aliases.findIndex((a) =>
                    a.toLowerCase() === alias.toLowerCase());

                if (aliasIndex > -1) {
                    await chat.sendChatMessage(
                        `'${trigger}'を使う別名'${alias}' はすでに存在します.`
                    );
                    return resolve();
                }

                command.aliases.push(alias);
                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await chat.sendChatMessage(
                    `'${trigger}'の別名として '${alias}' を追加しました`
                );

                break;
            }
            case "removealias": {
                const alias = remainingData.trim();

                if (args.length < 3 || alias === "") {
                    await chat.sendChatMessage(
                        `無効な命令. 使用方法: ${event.command.trigger} ${usage}`
                    );
                    return resolve();
                }

                const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await chat.sendChatMessage(
                        `'${trigger}' は見つかりません`
                    );
                    return resolve();
                }

                const aliasIndex = command.aliases.findIndex((a) =>
                    a.toLowerCase() === alias.toLowerCase());

                if (aliasIndex === -1) {
                    await chat.sendChatMessage(
                        `'${trigger}'の別名 '${alias}' は存在しません`
                    );
                    return resolve();
                }

                command.aliases.splice(aliasIndex, 1);
                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await chat.sendChatMessage(
                    `'${trigger}'の別名 ${alias}' を削除しました`
                );

                break;
            }
            default:
            }

            resolve();
        });
    }
};

module.exports = commandManagement;
