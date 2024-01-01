"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const commandManager = require("../../../chat/commands/CommandManager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const customRolesManager = require("../../../roles/custom-roles-manager");
const teamRolesManager = require("../../../roles/team-roles-manager");
const twitchRolesManager = require("../../../../shared/twitch-roles");
const omikujiMachine = require("./omikuji-machine");
const logger = require("../../../logwrapper");
const moment = require("moment");
const NodeCache = require("node-cache");

const activeOmikuji = new NodeCache({checkperiod: 2});
const cooldownCache = new NodeCache({checkperiod: 5});

const OMIKUJI_COMMAND_ID = "firebot:omikuji";

const omikujiCommand = {
    definition: {
        id: OMIKUJI_COMMAND_ID,
        name: "おみくじをひく",
        active: true,
        trigger: "!omikuji",
        description: "おみくじを開始します",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
        ]
    },
    onTriggerEvent: async event => {

        const { userCommand } = event;

        const omikujiSettings = gameManager.getGameSettings("firebot-omikuji");
        const chatter = omikujiSettings.settings.chatSettings.chatter;
        const username = userCommand.commandSender;

        let wagerAmount = omikujiSettings.settings.currencySettings.defaultWager;

        if (activeOmikuji.get(username)) {
            if (omikujiSettings.settings.generalMessages.alreadySpinning) {
                const alreadySpinningMsg = omikujiSettings.settings.generalMessages.alreadySpinning
                    .replace("{username}", username);

                await twitchChat.sendChatMessage(alreadySpinningMsg, null, chatter);
            }

            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
            if (omikujiSettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                const cooldownMsg = omikujiSettings.settings.generalMessages.onCooldown
                    .replace("{username}", username).replace("{timeRemaining}", timeRemainingDisplay);

                await twitchChat.sendChatMessage(cooldownMsg, null, chatter);
            }

            return;
        }


        const currencyId = omikujiSettings.settings.currencySettings.currencyId;
        let userBalance;
        try {
            userBalance = await currencyDatabase.getUserCurrencyAmount(username, currencyId);
        } catch (error) {
            logger.error(error);
            userBalance = 0;
        }

        if (userBalance < wagerAmount) {
            if (omikujiSettings.settings.generalMessages.notEnough) {
                const notEnoughMsg = omikujiSettings.settings.generalMessages.notEnough
                    .replace("{username}", username);

                await twitchChat.sendChatMessage(notEnoughMsg, null, chatter);
            }

            return;
        }

        activeOmikuji.set(username, true);

        const cooldownSecs = omikujiSettings.settings.cooldownSettings.cooldown;
        if (cooldownSecs && cooldownSecs > 0) {
            const expireTime = moment().add(cooldownSecs, 'seconds');
            cooldownCache.set(username, expireTime, cooldownSecs);
        }

        try {
            await currencyDatabase.adjustCurrencyForUser(username, currencyId, -Math.abs(wagerAmount));
        } catch (error) {
            logger.error(error);
            await twitchChat.sendChatMessage(`Sorry ${username}, there was an error deducting currency from your balance so the spin has been canceled.`, null, chatter);
            activeOmikuji.del(username);
            return;
        }

        const spinInActionMsg = omikujiSettings.settings.generalMessages.spinInAction
            .replace("{username}", username);
        const omikujiList = omikujiSettings.settings.omikujiSettings.OmikujiSpec;
        const showSpinInActionMsg = !!omikujiSettings.settings.generalMessages.spinInAction;
        const successfulResult = await omikujiMachine.omikuji(showSpinInActionMsg, spinInActionMsg, omikujiList, chatter);

        if (omikujiSettings.settings.generalMessages.spinSuccessful) {
            const spinSuccessfulMsg = omikujiSettings.settings.generalMessages.spinSuccessful
                .replace("{username}", username)
                .replace("{omikujiResult}", successfulResult);
            await twitchChat.sendChatMessage(spinSuccessfulMsg, null, chatter);
        }

        activeOmikuji.del(username);

    }
};

function registerSpinCommand() {
    if (!commandManager.hasSystemCommand(OMIKUJI_COMMAND_ID)) {
        commandManager.registerSystemCommand(omikujiCommand);
    }
}

function unregisterSpinCommand() {
    commandManager.unregisterSystemCommand(OMIKUJI_COMMAND_ID);
}

function purgeCaches() {
    cooldownCache.flushAll();
    activeOmikuji.flushAll();
}

exports.purgeCaches = purgeCaches;
exports.registerSpinCommand = registerSpinCommand;
exports.unregisterSpinCommand = unregisterSpinCommand;