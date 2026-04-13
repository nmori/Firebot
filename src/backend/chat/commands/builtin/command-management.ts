import { randomUUID } from "crypto";

import type { SystemCommand } from "../../../../types/commands";
import type { EffectInstance } from "../../../../types/effects";
import type { Restriction } from "../../../../types/restrictions";

import { CommandManager } from "../command-manager";
import { SettingsManager } from "../../../common/settings-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import customRolesManager from "../../../roles/custom-roles-manager";
import teamRolesManager from "../../../roles/team-roles-manager";
import frontendCommunicator from "../../../common/frontend-communicator";
import { capitalize } from "../../../utils";
import { getData } from "../../../cloud-sync";

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
        description: "チャットからカスタムコマンドを管理できます。",
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
                description: "指定した応答メッセージで新しいコマンドを追加します。"
            },
            {
                arg: "import",
                usage: "import [!trigger or \"phrase\"] [shareCode]",
                description: "「Share effects」機能で生成した共有コードからコマンドを読み込みます。"
            },
            {
                arg: "response",
                usage: "response [!trigger or \"phrase\"] [message]",
                description: "コマンドの応答メッセージを更新します。チャットエフェクトが 1 個以下のコマンドでのみ動作します。"
            },
            {
                arg: "setcount",
                usage: "setcount [!trigger or \"phrase\"] count#",
                description: "コマンドの使用回数を更新します。",
                minArgs: 3
            },
            {
                arg: "cooldown",
                usage: "cooldown [!trigger or \"phrase\"] [globalCooldownSecs] [userCooldownSecs]",
                description: "コマンドのクールダウンを変更します。"
            },
            {
                arg: "restrict",
                usage: "restrict [!trigger or \"phrase\"] [All/Sub/Mod/Streamer/Custom Group]",
                description: "コマンドの権限を更新します。"
            },
            {
                arg: "remove",
                usage: "remove [!trigger or \"phrase\"]",
                description: "指定したコマンドを削除します。"
            },
            {
                arg: "description",
                usage: "description [!trigger or \"phrase\"]",
                description: "コマンドの説明文を更新します。",
                minArgs: 3
            },
            {
                arg: "enable",
                usage: "enable [!trigger or \"phrase\"]",
                description: "指定したカスタムコマンドを有効にします。"
            },
            {
                arg: "disable",
                usage: "disable [!trigger or \"phrase\"]",
                description: "指定したカスタムコマンドを無効にします。"
            },
            {
                arg: "addalias",
                usage: "addalias [!trigger or \"phrase\"] !alias",
                description: "指定したカスタムコマンドにエイリアスを追加します。"
            },
            {
                arg: "removealias",
                usage: "removealias [!trigger or \"phrase\"] !alias",
                description: "指定したカスタムコマンドからエイリアスを削除します。"
            }
        ]
    },
    onTriggerEvent: async (event) => {
        const activeCustomCommands = CommandManager
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
                `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                null,
                true
            );
            return;
        }

        const { trigger, remainingData } = separateTriggerFromArgs(args);

        if (trigger == null || trigger === "") {
            await TwitchApi.chat.sendChatMessage(
                `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                null,
                true
            );
            return;
        }

        switch (triggeredArg) {
            case "add": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                if (CommandManager.triggerIsTaken(trigger) === true) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」はすでに使用されています。別のものをお試しください。`,
                        null,
                        true
                    );
                    return;
                }

                const canUseEffectVars = SettingsManager.getSetting("AllowChatCreatedCommandsToRunEffects");

                if (!canUseEffectVars && (remainingData.includes("$runEffect") || remainingData.includes("$evalVars"))) {
                    await TwitchApi.chat.sendChatMessage(
                        "コマンドを追加できませんでした。含まれている変数を使うには「Allow Chat-Created Commands to Run Effects」設定が必要です。",
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
                        id: randomUUID(),
                        list: [
                            {
                                id: randomUUID(),
                                type: "firebot:chat",
                                message: remainingData
                            }
                        ]
                    }
                };

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `コマンド「${trigger}」を追加しました。`,
                    null,
                    true
                );

                break;
            }

            case "import": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                if (CommandManager.triggerIsTaken(trigger) === true) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」はすでに使用されています。別のものをお試しください。`,
                        null,
                        true
                    );
                    return;
                }

                const canImport = SettingsManager.getSetting("AllowChatCreatedCommandsToRunEffects");

                if (!canImport) {
                    await TwitchApi.chat.sendChatMessage(
                        "コマンドを読み込めません。「Allow Chat-Created Commands to Run Effects」が設定で無効になっています。",
                        null,
                        true
                    );
                    return;
                }

                const effectsData = await getData<SharedEffects>(remainingData.trim());

                if (!effectsData || !effectsData.effects) {
                    await TwitchApi.chat.sendChatMessage(
                        "エフェクトデータを解析できませんでした。もう一度お試しください。",
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
                        id: randomUUID(),
                        list: effectsData.effects
                    }
                };

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `コマンド「${trigger}」を読み込みました。`,
                    null,
                    true
                );

                break;
            }

            case "response": {
                if (args.length < 3 || remainingData == null || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
                        null,
                        true
                    );
                    return;
                }

                const canUseEffectVars = SettingsManager.getSetting("AllowChatCreatedCommandsToRunEffects");

                if (!canUseEffectVars && (remainingData.includes("$runEffect") || remainingData.includes("$evalVars"))) {
                    await TwitchApi.chat.sendChatMessage(
                        "応答を更新できませんでした。含まれている変数を使うには「Allow Chat-Created Commands to Run Effects」設定が必要です。",
                        null,
                        true
                    );
                    return;
                }

                const chatEffectsCount = command.effects ? command.effects.list.filter(e => e.type === "firebot:chat").length : 0;

                if (chatEffectsCount > 1) {
                    await TwitchApi.chat.sendChatMessage(
                        `コマンド「${trigger}」にはチャットエフェクトが複数あるため、チャットから応答を編集できません。`,
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
                        id: randomUUID(),
                        type: "firebot:chat",
                        message: remainingData
                    };
                    command.effects.list.push(chatEffect);
                }

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `「${trigger}」の応答を更新しました: ${remainingData}`,
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
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
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

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `「${trigger}」の使用回数を ${newCount} に更新しました。`,
                    null,
                    true
                );

                break;
            }

            case "description": {
                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
                        null,
                        true
                    );
                    return;
                }

                if (remainingData == null || remainingData.length < 1) {
                    await TwitchApi.chat.sendChatMessage(
                        `「${trigger}」の説明文を入力してください。`,
                        null,
                        true
                    );
                    return;
                }

                command.description = remainingData;

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `「${trigger}」の説明文を更新しました: ${remainingData}`,
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
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
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

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `「${trigger}」のクールダウンを更新しました: ${userCooldown}秒（ユーザー）, ${globalCooldown}秒（全体）`,
                    null,
                    true
                );

                break;
            }

            case "restrict": {
                if (args.length < 3 || remainingData === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
                        null,
                        true
                    );
                    return;
                }

                const restrictions: Restriction[] = [];
                const roleIds = await mapPermArgToRoleIds(remainingData);


                if (roleIds == null || roleIds.length === 0) {
                    await TwitchApi.chat.sendChatMessage(
                        `有効なグループ名を指定してください: All、Sub、Mod、Streamer、またはカスタムグループ名`,
                        null,
                        true
                    );
                    return;
                }

                restrictions.push({
                    id: randomUUID(),
                    type: "firebot:permissions",
                    mode: "roles",
                    roleIds: roleIds
                });

                command.restrictionData = { restrictions: restrictions };

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(`「${trigger}」の権限を更新しました: ${remainingData}`, null, true);

                break;
            }

            case "remove": {
                const command = activeCustomCommands.find(c => c.trigger === trigger);
                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
                        null,
                        true
                    );
                    return;
                }

                CommandManager.removeCustomCommandByTrigger(trigger);

                await TwitchApi.chat.sendChatMessage(`コマンド「${trigger}」を削除しました。`, null, true);
                break;
            }

            case "disable":
            case "enable": {
                const command = CommandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
                        null,
                        true
                    );
                    return;
                }

                const newActiveStatus = triggeredArg === "enable";

                if (command.active === newActiveStatus) {
                    await TwitchApi.chat.sendChatMessage(
                        `「${trigger}」はすでに${triggeredArg === "enable" ? "有効" : "無効"}です。`, null, true
                    );
                    return;
                }

                command.active = newActiveStatus;

                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                frontendCommunicator.send("custom-commands-updated");

                await TwitchApi.chat.sendChatMessage(
                    `コマンド「${trigger}」を${newActiveStatus ? "有効" : "無効"}にしました。`, null, true
                );
                break;
            }

            case "addalias": {
                const alias = remainingData.trim();

                if (args.length < 3 || alias === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = CommandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
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
                        `エイリアス「${alias}」はコマンド「${trigger}」にすでに存在します。`,
                        null,
                        true
                    );
                    return;
                }

                command.aliases.push(alias);
                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `コマンド「${trigger}」にエイリアス「${alias}」を追加しました。`,
                    null,
                    true
                );

                break;
            }

            case "removealias": {
                const alias = remainingData.trim();

                if (args.length < 3 || alias === "") {
                    await TwitchApi.chat.sendChatMessage(
                        `無効なコマンドです。使い方: ${event.command.trigger} ${usage}`,
                        null,
                        true
                    );
                    return;
                }

                const command = CommandManager.getAllCustomCommands().find(c => c.trigger === trigger);

                if (command == null) {
                    await TwitchApi.chat.sendChatMessage(
                        `トリガー「${trigger}」のコマンドが見つかりません。もう一度お試しください。`,
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
                        `エイリアス「${alias}」はコマンド「${trigger}」に存在しません。`,
                        null,
                        true
                    );
                    return;
                }

                command.aliases.splice(aliasIndex, 1);
                CommandManager.saveCustomCommand(command, event.userCommand.commandSender);

                await TwitchApi.chat.sendChatMessage(
                    `コマンド「${trigger}」からエイリアス「${alias}」を削除しました。`,
                    null,
                    true
                );

                break;
            }
            default:
        }
    }
};