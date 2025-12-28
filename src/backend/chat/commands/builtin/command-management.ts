import { v4 as uuid } from "uuid";

import { SystemCommand } from "../../../../types/commands";
import { EffectInstance } from "../../../../types/effects";
import { getData } from "../../../cloud-sync";
import frontendCommunicator from "../../../common/frontend-communicator";
import { SettingsManager } from "../../../common/settings-manager";
import customRolesManager from "../../../roles/custom-roles-manager";
import teamRolesManager from "../../../roles/team-roles-manager";
import { capitalize } from "../../../utils";
import commandManager from "../command-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

interface TriggerWithArgs {
    trigger: string;
    remainingData: string;
}

interface SharedEffects {
    effects: EffectInstance[];
}

function separateTriggerFromArgs(args: string[]): TriggerWithArgs {
    let trigger: string, remainingData = "";
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

async function mapSingleRole(perm: string): Promise<string[]> {
    const groups: string[] = [];

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
}

async function mapMultipleRoles(permArray: string[]): Promise<string[]> {
    const groups: string[] = [];

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
}

async function mapPermArgToRoleIds(permArg: string): Promise<string[]> {
    if (permArg == null || permArg === "") {
        return [];
    }

    const normalizedPerm = permArg.toLowerCase().trim();
    let groups: string[] = [];

    if (normalizedPerm.includes(",")) {
        groups = await mapMultipleRoles(normalizedPerm.split(","));
    } else {
        groups = await mapSingleRole(normalizedPerm);
    }

    return groups;
}

/**
 * The `!command` command
 */
export const CommandManagementSystemCommand: SystemCommand = {
    definition: {
        id: "firebot:commandmanagement",
        name: "コマンド管理",
        active: true,
        trigger: "!command",
        description: "チャットによるカスタムコマンド管理が可能です。",
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
                usage: "add [!トリガー または \"フレーズ\"] [メッセージ]",
                description: "指定された応答メッセージを持つ新しいコマンドを追加します。"
            },
            {
                arg: "import",
                usage: "import [!トリガー または \"フレーズ\"] [共有コード]",
                description: "「演出を共有」機能で生成された共有コードを使用してコマンドをインポートします。"
            },
            {
                arg: "response",
                usage: "response [!トリガー または \"フレーズ\"] [メッセージ]",
                description: "コマンドの応答メッセージを更新します。チャットエフェクトが1つ以下のコマンドに対してのみ動作します。"
            },
            {
                arg: "setcount",
                usage: "setcount [!トリガー または \"フレーズ\"] カウント数",
                description: "コマンドの使用数を更新します。",
                minArgs: 3
            },
            {
                arg: "cooldown",
                usage: "cooldown [!トリガー または \"フレーズ\"] [全体再実行待ち秒数] [ユーザー再実行待ち秒数]",
                description: "コマンドの再応答待ち時間を変更します。"
            },
            {
                arg: "restrict",
                usage: "restrict [!トリガー または \"フレーズ\"] [All/Sub/Mod/Streamer/カスタムグループ]",
                description: "コマンドのパーミッションを更新します。"
            },
            {
                arg: "remove",
                usage: "remove [!トリガー または \"フレーズ\"]",
                description: "指定されたコマンドを削除します。"
            },
            {
                arg: "description",
                usage: "description [!トリガー または \"フレーズ\"]",
                description: "コマンドの説明を更新します。",
                minArgs: 3
            },
            {
                arg: "enable",
                usage: "enable [!トリガー または \"フレーズ\"]",
                description: "指定されたカスタムコマンドを有効にします。"
            },
            {
                arg: "disable",
                usage: "disable [!トリガー または \"フレーズ\"]",
                description: "指定されたカスタムコマンドを無効にします。"
            },
            {
                arg: "addalias",
                usage: "addalias [!トリガー または \"フレーズ\"] !エイリアス",
                description: "指定されたカスタムコマンドに指定されたエイリアスを追加します。"
            },
            {
                arg: "removealias",
                usage: "removealias [!トリガー または \"フレーズ\"] !エイリアス",
                description: "指定されたカスタムコマンドから指定されたエイリアスを削除します。"
            }
        ]
    },
    onTriggerEvent: async (event) => {
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
            await TwitchApi.chat.sendChatMessage(
                `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                null,
                true
            );
            return;
        }

        const { trigger, remainingData } = separateTriggerFromArgs(args);

        if (trigger == null || trigger === "") {
            await TwitchApi.chat.sendChatMessage(
                `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                null,
                true
            );
            return;
        }

        switch (triggeredArg) {
            case "add": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                if (commandManager.triggerIsTaken(trigger) === true) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー '${trigger}' はすでに使用中です。`,
                        null,
                        true
                    );
                    return;
                }

                const canUseEffectVars = SettingsManager.getSetting("AllowChatCreatedCommandsToRunEffects");

                if (!canUseEffectVars && (remainingData.includes("$runEffect") || remainingData.includes("$evalVars"))) {
                    await TwitchApi.chat.sendChatMessage(
                        "コマンドを追加できませんでした。含まれる変数には「チャットで作成されたコマンドの演出実行を許可」設定が必要です。",
                        null,
                        true
                    );
                    return;
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
                        id: uuid(),
                        list: [
                            {
                                id: uuid(),
                                type: "firebot:chat",
                                message: remainingData
                            }
                        ]
                    }
                };

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `コマンドを追加： '${trigger}'!`,
                    null,
                    true
                );

                break;
            }

            case "import": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                if (commandManager.triggerIsTaken(trigger) === true) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー '${trigger}' はすでに使用中です。再度お試しください。`,
                        null,
                        true
                    );
                    return;
                }

                const canImport = SettingsManager.getSetting("AllowChatCreatedCommandsToRunEffects");

                if (!canImport) {
                    await TwitchApi.chat.sendChatMessage(
                        "コマンドをインポートできません。設定で「チャットで作成されたコマンドの演出実行を許可」が無効になっています。",
                        null,
                        true
                    );
                    return;
                }

                const effectsData = await getData<SharedEffects>(remainingData.trim());

                if (!effectsData || !effectsData.effects) {
                    await TwitchApi.chat.sendChatMessage(
                        `演出データを解析できませんでした。再度お試しください。`,
                        null,
                        true
                    );
                    return;
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
                        id: uuid(),
                        list: effectsData.effects
                    }
                };

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `コマンド '${trigger}' をインポートしました！`,
                    null,
                    true
                );

                break;
            }

            case "response": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                const canUseEffectVars = SettingsManager.getSetting("AllowChatCreatedCommandsToRunEffects");

                if (!canUseEffectVars && (remainingData.includes("$runEffect") || remainingData.includes("$evalVars"))) {
                    await TwitchApi.chat.sendChatMessage(
                        "応答を更新できませんでした。含まれる変数には「チャットで作成されたコマンドの演出実行を許可」設定が必要です。",
                        null,
                        true
                    );
                    return;
                }

                const chatEffectsCount = command.effects ? command.effects.list.filter(e => e.type === "firebot:chat").length : 0;

                if (chatEffectsCount > 1) {
                    await TwitchApi.chat.sendChatMessage(
                        `コマンド'${trigger}'には複数のチャット演出があり、チャットで編集できないようになっています。`,
                        null,
                        true
                    );
                    return;
                }
                if (chatEffectsCount === 1) {
                    const chatEffect = command.effects.list.find(e => e.type === "firebot:chat");
                    chatEffect.message = remainingData;
                } else {
                    const chatEffect = {
                        id: uuid(),
                        type: "firebot:chat",
                        message: remainingData
                    };
                    command.effects.list.push(chatEffect);
                }

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `'${trigger}' の応答を更新しました： ${remainingData}`,
                    null,
                    true
                );

                break;
            }

            case "setcount": {
                const countArg = remainingData.trim();
                const numericCountArg = parseInt(countArg);
                if (countArg === "" || isNaN(numericCountArg)) {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                let newCount = parseInt(countArg);
                if (newCount < 0) {
                    newCount = 0;
                }

                command.count = newCount;

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `'${trigger}' の最新使用回数を ${newCount}回にしました`,
                    null,
                    true
                );

                break;
            }

            case "description": {
                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                if (remainingData == null || remainingData.length < 1) {
                    await TwitchApi.chat.sendChatMessage(
                        `'${trigger}'の概要を入力してください。`,
                        null,
                        true
                    );
                    return;
                }

                command.description = remainingData;

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `'${trigger}' の概要を ${remainingData} に設定しました。`,
                    null,
                    true
                );

                break;
            }

            case "cooldown": {
                const cooldownArgs = remainingData.trim().split(" ");
                let globalCooldown = parseInt(cooldownArgs[0]);
                let userCooldown = parseInt(cooldownArgs[1]);
                if (args.length < 3 || remainingData === "" || cooldownArgs.length < 2 || isNaN(globalCooldown)
                    || isNaN(userCooldown)) {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

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

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `'${trigger}' の再実行待ち時間を更新： ${userCooldown}秒 (ユーザ), ${globalCooldown}秒 (全体)`,
                    null,
                    true
                );

                break;
            }

            case "restrict": {
                if (args.length < 3 || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                const restrictions = [];
                const roleIds = await mapPermArgToRoleIds(remainingData);


                if (roleIds == null || roleIds.length === 0) {
                    await TwitchApi.chat.sendChatMessage(
                        `有効なグループ名：All、Sub、Mod、Streamer、またはカスタムグループ名を入力してください。`,
                        null,
                        true
                    );
                    return;
                }

                restrictions.push({
                    id: uuid(),
                    type: "firebot:permissions",
                    mode: "roles",
                    roleIds: roleIds
                });

                command.restrictionData = { restrictions: restrictions };

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(`'${trigger}' の制限を更新: ${remainingData}`, null, true);

                break;
            }

            case "remove": {
                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                commandManager.removeCustomCommandByTrigger(trigger);

                await TwitchApi.chat.sendChatMessage(`コマンドの削除に成功 '${trigger}'.`, null, true);
                break;
            }

            case "disable":
            case "enable": {
                const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                const newActiveStatus = triggeredArg === "enable";

                if (command.active === newActiveStatus) {
                    await TwitchApi.chat.sendChatMessage(
                        `${trigger} はすでに ${triggeredArg} です.`, null, true
                    );
                    return;
                }

                command.active = newActiveStatus;

                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                frontendCommunicator.send("custom-commands-updated");

                await TwitchApi.chat.sendChatMessage(
                    `${capitalize(triggeredArg)}d "${trigger}"`, null, true
                );
                break;
            }

            case "addalias": {
                const alias = remainingData.trim();

                if (args.length < 3 || alias === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                if (command.aliases == null) {
                    command.aliases = [];
                }

                const aliasIndex = command.aliases.findIndex(a =>
                    a.toLowerCase() === alias.toLowerCase());

                if (aliasIndex > -1) {
                    await TwitchApi.chat.sendChatMessage(
                        `エイリアス '${alias}' は、トリガー '${trigger}'を持つコマンドに既に存在します。`,
                        null,
                        true
                    );
                    return;
                }

                command.aliases.push(alias);
                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `カスタムコマンド'${trigger}'にエイリアス'${alias}'を追加しました`,
                    null,
                    true
                );

                break;
            }

            case "removealias": {
                const alias = remainingData.trim();

                if (args.length < 3 || alias === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使用法： ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = commandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドが見つかりません。`,
                        null,
                        true
                    );
                    return;
                }

                if (command.aliases == null) {
                    command.aliases = [];
                }

                const aliasIndex = command.aliases.findIndex(a =>
                    a.toLowerCase() === alias.toLowerCase());

                if (aliasIndex === -1) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー'${trigger}'を持つコマンドにエイリアス'${alias}'が存在しません。`,
                        null,
                        true
                    );
                    return;
                }

                command.aliases.splice(aliasIndex, 1);
                commandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `カスタムコマンド '${trigger}' からエイリアス '${alias}' を削除しました。`,
                    null,
                    true
                );

                break;
            }
            default:
        }
    }
};