import type { SystemCommand } from "../../types/commands";
import type { RankLadder } from "../../types/ranks";
import { CommandManager } from "../chat/commands/command-manager";
import { TwitchApi } from "../streaming-platforms/twitch/api";
import rankManager from "./rank-manager";
import viewerDatabase from "../viewers/viewer-database";
import logger from "../logwrapper";

type RankCommandRefreshRequestAction = "create" | "update" | "delete";

type RankCommandOptions = {
    selfRankMessageTemplate: string;
    otherRankMessageTemplate: string;
    rankListMessageTemplate: string;
    promoteRankMessageTemplate: string;
    demoteRankMessageTemplate: string;
    setRankMessageTemplate: string;
    removeRankMessageTemplate: string;
};

class RankCommandManager {
    constructor() {
        rankManager.on("created-item", (rankLadder: RankLadder) => {
            this.refreshRankCommand('create', rankLadder);
        });
        rankManager.on("updated-item", (rankLadder: RankLadder) => {
            this.refreshRankCommand('update', rankLadder);
        });
        rankManager.on("deleted-item", (rankLadder: RankLadder) => {
            this.refreshRankCommand('delete', rankLadder);
        });
    }

    createRankCommandDefinition(rankLadder: RankLadder): SystemCommand<RankCommandOptions> {
        const cleanRankLadderName = rankLadder.name.replace(/\s+/g, '-').toLowerCase();

        const sharedCommandOptions: Partial<SystemCommand<RankCommandOptions>["definition"]["options"]> = {
            selfRankMessageTemplate: {
                type: "string",
                title: "自分のランクメッセージテンプレート",
                description: "ユーザー自身のランクを表示するメッセージです。",
                tip: "変数: {rank}, {user}",
                default: `あなたの現在のランクは {rank} です。`,
                useTextArea: true
            },
            otherRankMessageTemplate: {
                type: "string",
                title: "他ユーザーのランクメッセージテンプレート",
                description: "別のユーザーのランクを表示するメッセージです。",
                tip: "変数: {rank}, {user}",
                default: `{user} の現在のランクは {rank} です。`,
                useTextArea: true
            },
            rankListMessageTemplate: {
                type: "string",
                title: "ランク一覧メッセージテンプレート",
                description: "ランク一覧を表示するメッセージです。",
                tip: "変数: {ranks}",
                default: `このラダーのランク一覧: {ranks}`,
                useTextArea: true
            }
        };

        const manualCommandOptions: Partial<SystemCommand<RankCommandOptions>["definition"]["options"]> = {
            promoteRankMessageTemplate: {
                type: "string",
                title: "昇格メッセージテンプレート",
                description: "ユーザーを昇格したときのメッセージです。",
                tip: "変数: {user}, {rank}",
                default: `@{user} が {rank} に昇格しました。`,
                useTextArea: true
            },
            demoteRankMessageTemplate: {
                type: "string",
                title: "降格メッセージテンプレート",
                description: "ユーザーを降格したときのメッセージです。",
                tip: "変数: {user}, {rank}",
                default: `@{user} が {rank} に降格しました。`,
                useTextArea: true
            },
            setRankMessageTemplate: {
                type: "string",
                title: "ランク設定メッセージテンプレート",
                description: "ユーザーのランクを設定したときのメッセージです。",
                tip: "変数: {user}, {rank}",
                default: `@{user} のランクを {rank} に更新しました。`,
                useTextArea: true
            },
            removeRankMessageTemplate: {
                type: "string",
                title: "ランク削除メッセージテンプレート",
                description: "ユーザーをランクラダーから削除したときのメッセージです。",
                tip: "変数: {user}",
                default: `@{user} のランクを削除しました。`,
                useTextArea: true
            }
        };

        const rankManagement: SystemCommand<RankCommandOptions> = {
            definition: {
                id: `firebot:rank-ladder:${rankLadder.id}`,
                name: `${rankLadder.name} ランク管理`,
                active: true,
                trigger: `!${cleanRankLadderName}`,
                description: `「${rankLadder.name}」ランクラダーを管理できます`,
                autoDeleteTrigger: false,
                scanWholeMessage: false,
                treatQuotedTextAsSingleArg: true,
                cooldown: {
                    user: 0,
                    global: 0
                },
                baseCommandDescription: "現在のランクを確認する",
                options: {
                    ...sharedCommandOptions,
                    ...(rankLadder.mode === "manual" ? manualCommandOptions : {})
                } as SystemCommand<RankCommandOptions>["definition"]["options"],
                subCommands: [
                    {
                        arg: "list",
                        usage: "list",
                        description: "このラダーのランク一覧を表示します"
                    },
                    {
                        id: "viewer-rank",
                        arg: "@\\w+",
                        regex: true,
                        usage: "@username",
                        description: "このラダーでの指定ユーザーのランクを表示します",
                        restrictionData: {
                            restrictions: [
                                {
                                    id: "sys-cmd-mods-only-perms",
                                    type: "firebot:permissions",
                                    mode: "roles",
                                    roleIds: [
                                        "mod",
                                        "broadcaster"
                                    ]
                                }
                            ]
                        }
                    },
                    ...(rankLadder.mode === "manual" ? [
                        {
                            arg: "promote",
                            usage: "promote [@user]",
                            description: "このラダーでユーザーを昇格させます",
                            minArgs: 2,
                            restrictionData: {
                                restrictions: [
                                    {
                                        id: "sys-cmd-mods-only-perms",
                                        type: "firebot:permissions",
                                        mode: "roles",
                                        roleIds: [
                                            "mod",
                                            "broadcaster"
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            arg: "demote",
                            usage: "demote [@user]",
                            description: "このラダーでユーザーを降格させます",
                            minArgs: 2,
                            restrictionData: {
                                restrictions: [
                                    {
                                        id: "sys-cmd-mods-only-perms",
                                        type: "firebot:permissions",
                                        mode: "roles",
                                        roleIds: [
                                            "mod",
                                            "broadcaster"
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            arg: "set",
                            usage: "set [@user] [rankname]",
                            description: "ユーザーのランクを指定したランクに設定します",
                            minArgs: 3,
                            restrictionData: {
                                restrictions: [
                                    {
                                        id: "sys-cmd-mods-only-perms",
                                        type: "firebot:permissions",
                                        mode: "roles",
                                        roleIds: [
                                            "mod",
                                            "broadcaster"
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            arg: "remove",
                            usage: "remove [@user]",
                            description: "ユーザーをランクラダーから削除します",
                            minArgs: 2,
                            restrictionData: {
                                restrictions: [
                                    {
                                        id: "sys-cmd-mods-only-perms",
                                        type: "firebot:permissions",
                                        mode: "roles",
                                        roleIds: [
                                            "mod",
                                            "broadcaster"
                                        ]
                                    }
                                ]
                            }
                        }] : [])
                ]
            },
            onTriggerEvent: async (event) => {
                const { commandOptions, chatMessage } = event;
                const triggeredSubcmd = event.userCommand.triggeredSubcmd;
                const args = event.userCommand.args;

                const sendMessage = (message: string) =>
                    TwitchApi.chat.sendChatMessage(message, chatMessage.id, true);

                // If no arguments are provided, show the user's rank
                if (args.length === 0) {
                    const userRank = await viewerDatabase.getViewerRankForLadderByUserName(event.userCommand.commandSender, rankLadder.id);
                    if (userRank) {
                        const rankMessage =
                            commandOptions.selfRankMessageTemplate
                                .replaceAll("{rank}", userRank.name)
                                .replaceAll("{user}", event.userCommand.commandSender);
                        await sendMessage(rankMessage);
                    } else {
                        await sendMessage("あなたはまだランクが割り当てられていません。");
                    }
                } else {
                    if (triggeredSubcmd.id === "viewer-rank") {
                        const username = args[0].replace("@", "");
                        const viewer = await viewerDatabase.getViewerByUsername(username);
                        if (!viewer) {
                            await sendMessage(`${username} が見つかりません。`);
                            return;
                        }

                        const viewerRank = await viewerDatabase.getViewerRankForLadder(viewer._id, rankLadder.id);
                        if (viewerRank) {
                            const rankMessage =
                                commandOptions.otherRankMessageTemplate
                                    .replaceAll("{rank}", viewerRank.name)
                                    .replaceAll("{user}", username);
                            await sendMessage(rankMessage);
                        } else {
                            await sendMessage(`${username} はまだランクが割り当てられていません。`);
                        }
                    } else if (triggeredSubcmd.arg === "list") {
                        const ranks = rankLadder.ranks
                            .map((rank) => {
                                const normalizedName = rank.name.replace(/\s+/g, '').toLowerCase();
                                if (normalizedName !== rank.name) {
                                    return `${rank.name} (${normalizedName})`;
                                }
                                return rank.name;
                            })
                            .join(", ");
                        const rankListMessage = commandOptions.rankListMessageTemplate
                            .replaceAll("{ranks}", ranks);
                        await sendMessage(rankListMessage);
                    } else if (triggeredSubcmd.arg === "promote") {
                        if (rankLadder.mode === "auto") {
                            await sendMessage("このランクラダーは自動モードです。直接管理はできません。");
                            return;
                        }

                        const username = args[1].replace("@", "");
                        const viewer = await viewerDatabase.getViewerByUsername(username);
                        if (!viewer) {
                            await sendMessage(`${username} が見つかりません。`);
                            return;
                        }
                        const ladderHelper = rankManager.getRankLadderHelper(rankLadder.id);
                        const currentRank = await viewerDatabase.getViewerRankForLadder(viewer._id, rankLadder.id);
                        const nextRankId = ladderHelper.getNextRankId(currentRank?.id);

                        if (!nextRankId) {
                            await sendMessage(`@${username} はすでに最高ランクです。`);
                            return;
                        }

                        const nextRank = ladderHelper.getRank(nextRankId);

                        await viewerDatabase.setViewerRank(viewer, rankLadder.id, nextRankId);

                        const promoteMessage = commandOptions.promoteRankMessageTemplate
                            .replaceAll("{user}", username)
                            .replaceAll("{rank}", nextRank.name);

                        await sendMessage(promoteMessage);
                    } else if (triggeredSubcmd.arg === "demote") {
                        if (rankLadder.mode === "auto") {
                            await sendMessage("このランクラダーは自動モードです。直接管理はできません。");
                            return;
                        }

                        const username = args[1].replace("@", "");
                        const viewer = await viewerDatabase.getViewerByUsername(username);
                        if (!viewer) {
                            await sendMessage(`${username} が見つかりません。`);
                            return;
                        }
                        const ladderHelper = rankManager.getRankLadderHelper(rankLadder.id);
                        const currentRank = await viewerDatabase.getViewerRankForLadder(viewer._id, rankLadder.id);

                        if (!currentRank) {
                            await sendMessage(`${username} はランクが割り当てられておらず、降格できません。`);
                            return;
                        }

                        const previousRankId = ladderHelper.getPreviousRankId(currentRank?.id);
                        const previousRank = ladderHelper.getRank(previousRankId);

                        await viewerDatabase.setViewerRank(viewer, rankLadder.id, previousRankId);

                        const demoteMessage = commandOptions.demoteRankMessageTemplate
                            .replaceAll("{user}", username)
                            .replaceAll("{rank}", previousRank?.name ?? "ランクなし");

                        await sendMessage(demoteMessage);
                    } else if (triggeredSubcmd.arg === "set") {
                        if (rankLadder.mode === "auto") {
                            await sendMessage("このランクラダーは自動モードです。直接管理はできません。");
                            return;
                        }

                        const username = args[1].replace("@", "");
                        const rankName = args[2];

                        const viewer = await viewerDatabase.getViewerByUsername(username);
                        if (!viewer) {
                            await sendMessage(`${username} が見つかりません。`);
                            return;
                        }

                        const ladderHelper = rankManager.getRankLadderHelper(rankLadder.id);
                        const rank = ladderHelper.getRankByName(rankName);
                        if (!rank) {
                            await sendMessage(`ランク「${rankName}」が見つかりません。`);
                            return;
                        }

                        await viewerDatabase.setViewerRank(viewer, rankLadder.id, rank.id);

                        const setRankMessage = commandOptions.setRankMessageTemplate
                            .replaceAll("{user}", username)
                            .replaceAll("{rank}", rank.name);

                        await sendMessage(setRankMessage);
                    } else if (triggeredSubcmd.arg === "remove") {
                        if (rankLadder.mode === "auto") {
                            await sendMessage("このランクラダーは自動モードです。直接管理はできません。");
                            return;
                        }

                        const username = args[1].replace("@", "");
                        const viewer = await viewerDatabase.getViewerByUsername(username);
                        if (!viewer) {
                            await sendMessage(`${username} が見つかりません。`);
                            return;
                        }

                        await viewerDatabase.setViewerRank(viewer, rankLadder.id, null);

                        const removeRankMessage = commandOptions.removeRankMessageTemplate
                            .replaceAll("{user}", username);

                        await sendMessage(removeRankMessage);
                    } else {
                        await sendMessage("無効なコマンドです。");
                    }
                }
            }
        };

        return rankManagement;
    }

    refreshRankCommand(
        action: RankCommandRefreshRequestAction = null,
        rankLadder: RankLadder = null
    ): void {
        if (rankLadder == null) {
            logger.error('Invalid rank ladder passed to refresh rank ladder commands.');
            return;
        }

        logger.debug(`Rank ladder "${rankLadder.name}" action "${action}" triggered. Updating rank ladder system commands.`);

        switch (action) {
            case "update":
                CommandManager.unregisterSystemCommand(`firebot:rank-ladder:${rankLadder.id}`);
                CommandManager.registerSystemCommand(
                    this.createRankCommandDefinition(rankLadder)
                );
                break;
            case "delete":
                CommandManager.unregisterSystemCommand(`firebot:rank-ladder:${rankLadder.id}`);
                break;
            case "create":
                CommandManager.registerSystemCommand(
                    this.createRankCommandDefinition(rankLadder)
                );
                break;
            default:
                logger.error('Invalid action passed to refresh rank ladder commands.');
                return;
        }
    }

    createAllRankLadderCommands(): void {
        logger.info('Creating all rank ladder commands.');

        const rankLadders = rankManager.getAllItems();

        for (const rankLadder of rankLadders) {
            this.refreshRankCommand('create', rankLadder);
        }
    }
}

const rankCommandManager = new RankCommandManager();

export = rankCommandManager;