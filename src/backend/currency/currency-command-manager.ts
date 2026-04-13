import type { SystemCommand } from "../../types/commands";
import type { Currency } from "../../types/currency";
import { CommandManager } from "../chat/commands/command-manager";
import { TwitchApi } from "../streaming-platforms/twitch/api";
import currencyAccess from "./currency-access";
import currencyManager from "./currency-manager";
import logger from "../logwrapper";
import { commafy } from "../utils";

type CurrencyCommandRefreshRequestAction = "create" | "update" | "delete";

class CurrencyCommandManager {
    constructor() {
        currencyAccess.on("currencies:currency-created", (currency: Currency) => {
            this.refreshCurrencyCommands("create", currency);
        });

        currencyAccess.on("currencies:currency-updated", (currency: Currency) => {
            this.refreshCurrencyCommands("update", currency);
        });

        currencyAccess.on("currencies:currency-deleted", (currency: Currency) => {
            this.refreshCurrencyCommands("delete", currency);
        });
    }

    /**
     * Creates a command definition when given a currency name.
     */
    createCurrencyCommandDefinition(currency: Partial<Currency>): SystemCommand<{
        currencyBalanceMessageTemplate: string;
        whisperCurrencyBalanceMessage: boolean;
        addMessageTemplate: string;
        setMessageTemplate: string;
        removeMessageTemplate: string;
        addAllMessageTemplate: string;
        removeAllMessageTemplate: string;
    }> {
        const currencyId = currency.id,
            currencyName = currency.name,
            cleanName = currencyName.replace(/\s+/g, '-').toLowerCase(); // lowecase and replace spaces with dash.

        // Define our command.
        const commandManagement: SystemCommand<{
            currencyBalanceMessageTemplate: string;
            whisperCurrencyBalanceMessage: boolean;
            addMessageTemplate: string;
            setMessageTemplate: string;
            removeMessageTemplate: string;
            addAllMessageTemplate: string;
            removeAllMessageTemplate: string;
        }> = {
            definition: {
                id: `firebot:currency:${currencyId}`,
                name: `${currencyName} 管理`,
                active: true,
                trigger: `!${cleanName}`,
                description: `「${currencyName}」通貨を管理できます`,
                autoDeleteTrigger: false,
                scanWholeMessage: false,
                currency: {
                    name: currencyName,
                    id: currencyId
                },
                cooldown: {
                    user: 0,
                    global: 0
                },
                baseCommandDescription: "残高を確認する",
                options: {
                    currencyBalanceMessageTemplate: {
                        type: "string",
                        title: "通貨残高メッセージのテンプレート",
                        description: "チャットでの通貨残高メッセージの表示形式です。",
                        tip: "変数: {user}, {currency}, {amount}",
                        default: `{user} の {currency} は {amount} です`,
                        useTextArea: true
                    },
                    whisperCurrencyBalanceMessage: {
                        type: "boolean",
                        title: "通貨残高をウィスパーで通知する",
                        default: false
                    },
                    addMessageTemplate: {
                        type: "string",
                        title: "通貨追加メッセージのテンプレート",
                        description: "!currency add メッセージの表示形式です。",
                        tip: "変数: {user}, {currency}, {amount}",
                        default: `{user} に {currency} を {amount} 追加しました。`,
                        useTextArea: true
                    },
                    removeMessageTemplate: {
                        type: "string",
                        title: "通貨削除メッセージのテンプレート",
                        description: "!currency remove メッセージの表示形式です。",
                        tip: "変数: {user}, {currency}, {amount}",
                        default: `{user} から {currency} を {amount} 削除しました。`,
                        useTextArea: true
                    },
                    addAllMessageTemplate: {
                        type: "string",
                        title: "全員への通貨追加メッセージのテンプレート",
                        description: "!currency addall メッセージの表示形式です。",
                        tip: "変数: {currency}, {amount}",
                        default: `全員に {currency} を {amount} 追加しました！`,
                        useTextArea: true
                    },
                    removeAllMessageTemplate: {
                        type: "string",
                        title: "全員からの通貨削除メッセージのテンプレート",
                        description: "!currency removeall メッセージの表示形式です。",
                        tip: "変数: {currency}, {amount}",
                        default: `全員から {currency} を {amount} 削除しました！`,
                        useTextArea: true
                    },
                    setMessageTemplate: {
                        type: "string",
                        title: "通貨設定メッセージのテンプレート",
                        description: "!currency set メッセージの表示形式です。",
                        tip: "変数: {user}, {currency}, {amount}",
                        default: `{user} の {currency} を {amount} に設定しました！`,
                        useTextArea: true
                    }
                },
                subCommands: [
                    {
                        id: "viewer-currency",
                        arg: "@\\w+",
                        regex: true,
                        usage: "@username",
                        description: "指定ユーザーの通貨残高を表示します",
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
                        arg: "add",
                        usage: "add [@user] [amount]",
                        description: "指定ユーザーの通貨を追加します。",
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
                        usage: "remove [@user] [amount]",
                        description: "指定ユーザーの通貨を削除します。",
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
                        arg: "give",
                        usage: "give [@user] [amount]",
                        description: "別のユーザーに通貨を渡します。"
                    },
                    {
                        arg: "set",
                        usage: "set [@user] [amount]",
                        description: "通貨を指定数値に設定します。",
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
                        arg: "addall",
                        usage: "addall [amount]",
                        description: "オンラインのすべてのユーザーに通貨を追加します。",
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
                        arg: "removeall",
                        usage: "removeall [amount]",
                        description: "オンラインのすべてのユーザーから通貨を削除します。",
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
                    }
                ]
            },
            /**
         * When the command is triggered
         */
            onTriggerEvent: async (event) => {
                const { commandOptions } = event;
                const triggeredArg = event.userCommand.triggeredArg;
                const triggeredSubcmd = event.userCommand.triggeredSubcmd;
                const args = event.userCommand.args;
                const currencyName = event.command.currency.name;

                // No args, tell the user how much currency they have.
                if (args.length === 0) {
                    const amount = await currencyManager.getViewerCurrencyAmount(event.userCommand.commandSender, currencyId);
                    if (!isNaN(amount)) {
                        const balanceMessage = commandOptions.currencyBalanceMessageTemplate
                            .replaceAll("{user}", event.userCommand.commandSender)
                            .replaceAll("{currency}", currencyName)
                            .replaceAll("{amount}", commafy(amount));

                        if (commandOptions.whisperCurrencyBalanceMessage) {
                            const user = await TwitchApi.users.getUserByName(event.userCommand.commandSender);
                            await TwitchApi.whispers.sendWhisper(user.id, balanceMessage, true);
                        } else {
                            await TwitchApi.chat.sendChatMessage(balanceMessage, null, true);
                        }
                    } else {
                        logger.error('Error while trying to show currency amount to user via chat command.');
                    }

                    return;
                }

                // Arguments passed, what are we even doing?!?
                switch (triggeredArg) {
                    case "add": {
                        // Get username and make sure our currency amount is a positive integer.
                        const username = args[1].replace(/^@/, ''),
                            currencyAdjust = Math.abs(parseInt(args[2]));

                        // Adjust currency, it will return true on success and false on failure.
                        const status = await currencyManager.adjustCurrencyForViewer(username, currencyId, currencyAdjust);

                        if (status) {
                            const addMessageTemplate = commandOptions.addMessageTemplate
                                .replaceAll("{user}", username)
                                .replaceAll("{currency}", currencyName)
                                .replaceAll("{amount}", commafy(currencyAdjust));
                            await TwitchApi.chat.sendChatMessage(addMessageTemplate, null, true);
                        } else {
                            // Error removing currency.
                            logger.error(`Error adding currency for user (${username}) via chat command. Currency: ${currencyId}. Value: ${currencyAdjust}`);
                            await TwitchApi.chat.sendChatMessage(`エラー: ユーザーへの通貨追加に失敗しました。`, null, true);
                        }

                        break;
                    }
                    case "remove": {
                        // Get username and make sure our currency amount is a negative integer.
                        const username = args[1].replace(/^@/, ''),
                            currencyAdjust = -Math.abs(parseInt(args[2]));

                        // Adjust currency, it will return true on success and false on failure.
                        const adjustSuccess = await currencyManager.adjustCurrencyForViewer(username, currencyId, currencyAdjust);
                        if (adjustSuccess) {
                            const removeMessageTemplate = commandOptions.removeMessageTemplate
                                .replaceAll("{user}", username)
                                .replaceAll("{currency}", currencyName)
                                .replaceAll("{amount}", commafy(parseInt(args[2])));
                            await TwitchApi.chat.sendChatMessage(removeMessageTemplate, null, true);
                        } else {
                            // Error removing currency.
                            logger.error(`Error removing currency for user (${username}) via chat command. Currency: ${currencyId}. Value: ${currencyAdjust}`);
                            await TwitchApi.chat.sendChatMessage(`エラー: ユーザーからの通貨削除に失敗しました。`, null, true);
                        }

                        break;
                    }
                    case "set": {
                        // Get username and make sure our currency amount is a positive integer.
                        const username = args[1].replace(/^@/, ''),
                            currencyAdjust = Math.abs(parseInt(args[2]));

                        // Adjust currency, it will return true on success and false on failure.
                        const status = await currencyManager.adjustCurrencyForViewer(username, currencyId, currencyAdjust, "set");

                        if (status) {
                            const setMessageTemplate = commandOptions.setMessageTemplate
                                .replaceAll("{user}", username)
                                .replaceAll("{currency}", currencyName)
                                .replaceAll("{amount}", commafy(currencyAdjust));
                            await TwitchApi.chat.sendChatMessage(setMessageTemplate, null, true);
                        } else {
                            // Error removing currency.
                            logger.error(`Error setting currency for user (${username}) via chat command. Currency: ${currencyId}. Value: ${currencyAdjust}`);
                            await TwitchApi.chat.sendChatMessage(`エラー: ユーザーへの通貨設定に失敗しました。`, null, true);
                        }

                        break;
                    }
                    case "give": {
                        // Get username and make sure our currency amount is a positive integer.
                        const username = args[1].replace(/^@/, ''),
                            currencyAdjust = Math.abs(parseInt(args[2])),
                            currencyAdjustNeg = -Math.abs(parseInt(args[2]));

                        // Does this currency have transfer active?
                        const currencyCheck = currencyAccess.getCurrencies();
                        if (currencyCheck[currencyId].transfer === "Disallow") {
                            logger.debug(`${event.userCommand.commandSender} tried to give currency, but transfers are turned off for it. ${currencyId}`);
                            await TwitchApi.chat.sendChatMessage('この通貨はトランスファーが許可されていません。', null, true);
                            return false;
                        }

                        // Don't allow person to give themselves currency.
                        if (event.userCommand.commandSender.toLowerCase() === username.toLowerCase()) {
                            logger.debug(`${username} tried to give themselves currency.`);
                            await TwitchApi.chat.sendChatMessage(
                                `${event.userCommand.commandSender}、自分自身に通貨を渡すことはできません。`,
                                null,
                                true
                            );
                            return false;
                        }

                        // eslint-disable-next-line no-warning-comments
                        // Need to check to make sure they have enough currency before continuing.
                        const userAmount = await currencyManager.getViewerCurrencyAmount(event.userCommand.commandSender, currencyId);

                        // If we get null, there was an error.
                        if (userAmount == null) {
                            await TwitchApi.chat.sendChatMessage('エラー: 通貨残高を取得できませんでした。', null, true);
                            return false;
                        }

                        // Check to make sure we have enough currency to give.
                        if (userAmount < currencyAdjust) {
                            await TwitchApi.chat.sendChatMessage(`${currencyName} が足りません。`, null, true);
                            return false;
                        }

                        // Okay, try to add to user first. User is not guaranteed to be in the DB because of possible typos.
                        // So we check this first, then remove from the command sender if this succeeds.
                        const adjustCurrencySuccess = await currencyManager.adjustCurrencyForViewer(username, currencyId, currencyAdjust);
                        if (adjustCurrencySuccess) {
                            // Subtract currency from command user now.
                            const status = await currencyManager.adjustCurrencyForViewer(event.userCommand.commandSender, currencyId, currencyAdjustNeg);

                            if (status) {
                                await TwitchApi.chat.sendChatMessage(`${username} に ${currencyName} を ${commafy(currencyAdjust)} 渡しました。`, null, true);
                            } else {
                                // Error removing currency.
                                logger.error(`Error removing currency during give transaction for user (${username}) via chat command. Currency: ${currencyId}. Value: ${currencyAdjust}`);
                                await TwitchApi.chat.sendChatMessage(
                                    `エラー: give トランザクション中のユーザーからの通貨削除に失敗しました。`,
                                    null,
                                    true
                                );
                                return false;
                            }
                        } else {
                            // Error removing currency.
                            logger.error(`Error adding currency during give transaction for user (${username}) via chat command. Currency: ${currencyId}. Value: ${currencyAdjust}`);
                            await TwitchApi.chat.sendChatMessage(`エラー: ユーザーへの通貨追加に失敗しました。ユーザー名の入力ミスはありませんか？`, null, true);
                            return false;
                        }

                        break;
                    }
                    case "addall": {
                        const currencyAdjust = Math.abs(parseInt(args[1]));
                        if (isNaN(currencyAdjust)) {
                            await TwitchApi.chat.sendChatMessage(`エラー: オンラインユーザーへの通貨一括追加に失敗しました。`, null, true);
                            return;
                        }
                        void currencyManager.addCurrencyToOnlineViewers(currencyId, currencyAdjust, true);

                        const addAllMessageTemplate = commandOptions.addAllMessageTemplate
                            .replaceAll("{currency}", currencyName)
                            .replaceAll("{amount}", commafy(currencyAdjust));
                        await TwitchApi.chat.sendChatMessage(addAllMessageTemplate, null, true);

                        break;
                    }
                    case "removeall": {
                        const currencyAdjust = -Math.abs(parseInt(args[1]));
                        if (isNaN(currencyAdjust)) {
                            await TwitchApi.chat.sendChatMessage(`エラー: オンラインユーザーからの通貨一括削除に失敗しました。`, null, true);
                            return;
                        }
                        void currencyManager.addCurrencyToOnlineViewers(currencyId, currencyAdjust, true);

                        const removeAllMessageTemplate = commandOptions.removeAllMessageTemplate
                            .replaceAll("{currency}", currencyName)
                            .replaceAll("{amount}", commafy(parseInt(args[1])));
                        await TwitchApi.chat.sendChatMessage(removeAllMessageTemplate, null, true);

                        break;
                    }
                    default: {
                        if (triggeredSubcmd.id === "viewer-currency") {
                            const username = args[0].replace("@", "");
                            const amount = await currencyManager.getViewerCurrencyAmount(username, currencyId);
                            if (!isNaN(amount)) {
                                const balanceMessage = commandOptions.currencyBalanceMessageTemplate
                                    .replaceAll("{user}", username)
                                    .replaceAll("{currency}", currencyName)
                                    .replaceAll("{amount}", commafy(amount));

                                if (commandOptions.whisperCurrencyBalanceMessage) {
                                    const user = await TwitchApi.users.getUserByName(username);
                                    await TwitchApi.whispers.sendWhisper(user.id, balanceMessage, true);
                                } else {
                                    await TwitchApi.chat.sendChatMessage(balanceMessage, null, true);
                                }
                            } else {
                                logger.error('Error while trying to show currency amount to user via chat command.');
                            }
                        } else {
                            const amount = await currencyManager.getViewerCurrencyAmount(event.userCommand.commandSender, currencyId);
                            if (!isNaN(amount)) {
                                const balanceMessage = commandOptions.currencyBalanceMessageTemplate
                                    .replaceAll("{user}", event.userCommand.commandSender)
                                    .replaceAll("{currency}", currencyName)
                                    .replaceAll("{amount}", commafy(amount));

                                if (commandOptions.whisperCurrencyBalanceMessage) {
                                    const user = await TwitchApi.users.getUserByName(event.userCommand.commandSender);
                                    await TwitchApi.whispers.sendWhisper(user.id, balanceMessage, true);
                                } else {
                                    await TwitchApi.chat.sendChatMessage(balanceMessage, null, true);
                                }
                            } else {
                                logger.error('Error while trying to show currency amount to user via chat command.');
                            }
                        }
                    }
                }
            }
        };

        return commandManagement;
    }

    /**
     * Makes sure our currency system commands are up to date.
     */
    refreshCurrencyCommands(
        action: CurrencyCommandRefreshRequestAction = null,
        currency: Partial<Currency> = null
    ): void {
    // If we don't get currency stop here.
        if (currency == null) {
            logger.error('Invalid currency passed to refresh currency commands.');
            return;
        }

        // Log our action for logger.
        logger.debug(`Currency "${currency.name}" action "${action}" triggered. Updating currency system commands.`);

        // Decide what we want to do based on the action that was passed to us.
        switch (action) {
            case "update":
                CommandManager.unregisterSystemCommand(`firebot:currency:${currency.id}`);
                CommandManager.registerSystemCommand(
                    this.createCurrencyCommandDefinition(currency)
                );
                break;
            case "delete":
                // Delete the system command for this currency.
                CommandManager.unregisterSystemCommand(`firebot:currency:${currency.id}`);
                break;
            case "create":
                // Build a new system command def and register it.
                CommandManager.registerSystemCommand(
                    this.createCurrencyCommandDefinition(currency)
                );
                break;
            default:
                logger.error('Invalid action passed to refresh currency commands.');
                return;
        }
    }

    /**
     * Loops through all currencies we have and passes them to refresh currency commands.
     * This lets us create all of our currency commands when the application is started.
     */
    createAllCurrencyCommands(): void {
        logger.info('Creating all currency commands.');
        const currencyData = currencyAccess.getCurrencies();

        Object.values(currencyData).forEach((currency) => {
            this.refreshCurrencyCommands('create', currency);
        });
    }
}

const currencyCommandManager = new CurrencyCommandManager();

export = currencyCommandManager;