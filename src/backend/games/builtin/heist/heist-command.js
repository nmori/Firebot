"use strict";


const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const twitchApi = require("../../../twitch-api/api");
const commandManager = require("../../../chat/commands/CommandManager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const customRolesManager = require("../../../roles/custom-roles-manager");
const teamRolesManager = require("../../../roles/team-roles-manager");
const twitchRolesManager = require("../../../../shared/twitch-roles");
const moment = require("moment");

const heistRunner = require("./heist-runner");

const HEIST_COMMAND_ID = "firebot:heist";

const heistCommand = {
    definition: {
        id: HEIST_COMMAND_ID,
        name: "強盗",
        active: true,
        trigger: "!heist",
        description: "視聴者が強盗ゲームをプレイできるようにする。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        baseCommandDescription: "デフォルトの賭け金額が設定されている場合、その金額で強盗を開始／参加する」",
        subCommands: [
            {
                id: "wagerAmount",
                arg: "\\d+",
                regex: true,
                usage: "[wagerAmount]",
                description: "指定された金額で強盗を開始/参加する。",
                hideCooldowns: true
            }
        ]
    },
    onTriggerEvent: async event => {

        const { chatEvent, userCommand } = event;

        const username = userCommand.commandSender;

        const heistSettings = gameManager.getGameSettings("firebot-heist");
        const chatter = heistSettings.settings.chatSettings.chatter;

        const currencyId = heistSettings.settings.currencySettings.currencyId;
        const currency = currencyDatabase.getCurrencyById(currencyId);

        // make sure the currency still exists
        if (currency == null) {
            await twitchChat.sendChatMessage("STOP:選択した通貨が存在しない", null, chatter);
            await twitchApi.chat.deleteChatMessage(chatEvent.id);
        }

        // see if the heist is on cooldown before doing anything else
        if (heistRunner.cooldownExpireTime && moment().isBefore(heistRunner.cooldownExpireTime)) {
            if (heistSettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(heistRunner.cooldownExpireTime, '秒')));
                const cooldownMsg = heistSettings.settings.generalMessages.onCooldown
                    .replace("{cooldown}", timeRemainingDisplay);

                await twitchChat.sendChatMessage(cooldownMsg, null, chatter);
            }

            return;
        }

        // check if the user has already joined an active heist
        if (heistRunner.lobbyOpen && heistRunner.userOnTeam(username)) {
            if (heistSettings.settings.entryMessages.alreadyJoined) {
                const alreadyJoinedMsg = heistSettings.settings.entryMessages.alreadyJoined
                    .replace("{user}", username);

                await twitchChat.sendChatMessage(alreadyJoinedMsg, null, chatter);
            }

            return;
        }

        // parse the wager amount
        let wagerAmount;
        if (event.userCommand.args.length < 1) {
            const defaultWager = heistSettings.settings.currencySettings.defaultWager;
            if ((defaultWager == null || defaultWager < 1)) {
                if (heistSettings.settings.entryMessages.noWagerAmount) {
                    const noWagerAmountMsg = heistSettings.settings.entryMessages.noWagerAmount
                        .replace("{user}", username);

                    await twitchChat.sendChatMessage(noWagerAmountMsg, null, chatter);
                }

                return;
            }
            wagerAmount = defaultWager;
        } else if (event.userCommand.subcommandId === "wagerAmount") {
            const triggeredArg = userCommand.args[0];
            wagerAmount = parseInt(triggeredArg);
        } else {
            if (heistSettings.settings.entryMessages.invalidWagerAmount) {
                const invalidWagerAmountMsg = heistSettings.settings.entryMessages.invalidWagerAmount
                    .replace("{user}", username);

                await twitchChat.sendChatMessage(invalidWagerAmountMsg, null, chatter);
            }

            return;
        }

        wagerAmount = Math.floor(wagerAmount || 0);

        // make sure wager doesnt violate min or max values
        const minWager = heistSettings.settings.currencySettings.minWager || 1;
        if (minWager != null & minWager > 0) {
            if (wagerAmount < minWager) {
                if (heistSettings.settings.entryMessages.wagerAmountTooLow) {
                    const wagerAmountTooLowMsg = heistSettings.settings.entryMessages.wagerAmountTooLow
                        .replace("{user}", username)
                        .replace("minWager}", minWager);

                    await twitchChat.sendChatMessage(wagerAmountTooLowMsg, null, chatter);
                }

                return;
            }
        }
        const maxWager = heistSettings.settings.currencySettings.maxWager;
        if (maxWager != null & maxWager > 0) {
            if (wagerAmount > maxWager) {
                if (heistSettings.settings.entryMessages.wagerAmountTooHigh) {
                    const wagerAmountTooHighMsg = heistSettings.settings.entryMessages.wagerAmountTooHigh
                        .replace("{user}", username)
                        .replace("{maxWager}", maxWager);

                    await twitchChat.sendChatMessage(wagerAmountTooHighMsg, null, chatter);
                }

                return;
            }
        }

        // check users balance
        const userBalance = await currencyDatabase.getUserCurrencyAmount(username, currencyId);
        if (userBalance < wagerAmount) {
            if (heistSettings.settings.entryMessages.notEnoughToWager) {
                const notEnoughToWagerMsg = heistSettings.settings.entryMessages.notEnoughToWager
                    .replace("{user}", username);

                await twitchChat.sendChatMessage(notEnoughToWagerMsg, null, chatter);
            }

            return;
        }

        // deduct wager from user balance
        await currencyDatabase.adjustCurrencyForUser(username, currencyId, -Math.abs(wagerAmount));

        // get all user roles
        const userCustomRoles = customRolesManager.getAllCustomRolesForViewer(username) || [];
        const userTeamRoles = await teamRolesManager.getAllTeamRolesForViewer(username) || [];
        const userTwitchRoles = (userCommand.senderRoles || [])
            .map(r => twitchRolesManager.mapTwitchRole(r))
            .filter(r => !!r);
        const allRoles = [
            ...userTwitchRoles,
            ...userTeamRoles,
            ...userCustomRoles
        ];

        // get the users success percentage
        let successChance = 50;
        const successChancesSettings = heistSettings.settings.successChanceSettings.successChances;
        if (successChancesSettings) {
            successChance = successChancesSettings.basePercent;

            for (const role of successChancesSettings.roles) {
                if (allRoles.some(r => r.id === role.roleId)) {
                    successChance = role.percent;
                    break;
                }
            }
        }

        // get the users winnings multiplier
        let winningsMultiplier = 1.5;
        const winningsMultiplierSettings = heistSettings.settings.winningsMultiplierSettings.multipliers;
        if (winningsMultiplierSettings) {
            winningsMultiplier = winningsMultiplierSettings.base;

            for (const role of winningsMultiplierSettings.roles) {
                if (allRoles.some(r => r.id === role.roleId)) {
                    winningsMultiplier = role.value;
                    break;
                }
            }
        }

        // Ensure the game has been started and the lobby ready
        if (!heistRunner.lobbyOpen) {

            const startDelay = heistSettings.settings.generalSettings.startDelay || 1;
            heistRunner.triggerLobbyStart(startDelay);

            const teamCreationMessage = heistSettings.settings.generalMessages.teamCreation
                .replace("{user}", username)
                .replace("{command}", userCommand.trigger)
                .replace("{maxWager}", maxWager)
                .replace("{minMager}", minWager)
                .replace("{requiredUsers}", heistSettings.settings.generalSettings.minimumUsers);

            if (teamCreationMessage) {
                await twitchChat.sendChatMessage(teamCreationMessage, null, chatter);
            }
        }

        // add the user to the game
        heistRunner.addUser({
            username: username,
            wager: wagerAmount,
            successPercentage: successChance,
            winnings: Math.floor(wagerAmount * winningsMultiplier)
        });

        const onJoinMessage = heistSettings.settings.entryMessages.onJoin
            .replace("{user}", username)
            .replace("{wager}", util.commafy(wagerAmount))
            .replace("{currency}", currency.name);

        if (onJoinMessage) {
            await twitchChat.sendChatMessage(onJoinMessage, null, chatter);
        }
    }
};

function registerHeistCommand() {
    if (!commandManager.hasSystemCommand(HEIST_COMMAND_ID)) {
        commandManager.registerSystemCommand(heistCommand);
    }
}

function unregisterHeistCommand() {
    commandManager.unregisterSystemCommand(HEIST_COMMAND_ID);
}

function clearCooldown() {
    heistRunner.clearCooldowns();
}

exports.clearCooldown = clearCooldown;
exports.registerHeistCommand = registerHeistCommand;
exports.unregisterHeistCommand = unregisterHeistCommand;