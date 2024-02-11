"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const commandManager = require("../../../chat/commands/command-manager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
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

        const { userCommand,chatMessage } = event;

        const omikujiSettings = gameManager.getGameSettings("firebot-omikuji");
        const chatter = omikujiSettings.settings.chatSettings.chatter;
        const username = chatMessage.username;
        const displayName = chatMessage.displayName;

        let wagerAmount = omikujiSettings.settings.currencySettings.defaultWager;

        if (activeOmikuji.get(username)) {
            if (omikujiSettings.settings.generalMessages.alreadyOmikujining) {
                const alreadyOmikujiningMsg = omikujiSettings.settings.generalMessages.alreadyOmikujining
                    .replace("{username}", username)
                    .replace("{displayName}", displayName);

                await twitchChat.sendChatMessage(alreadyOmikujiningMsg, null, chatter);
            }

            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
            if (omikujiSettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                const cooldownMsg = omikujiSettings.settings.generalMessages.onCooldown
                    .replace("{username}", username)
                    .replace("{timeRemaining}", timeRemainingDisplay)
                    .replace("{displayName}", displayName);

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
                    .replace("{username}", username)
                    .replace("{displayName}", displayName);

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
            await twitchChat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生したため、おみくじはキャンセルされました。`, null, chatter);
            activeOmikuji.del(username);
            return;
        }

        const OmikujiInActionMsg = omikujiSettings.settings.generalMessages.OmikujiInAction
            .replace("{username}", username)
            .replace("{displayName}", displayName);

        const omikujiList = omikujiSettings.settings.omikujiSettings.OmikujiSpec;
        const showOmikujiInActionMsg = !!omikujiSettings.settings.generalMessages.OmikujiInAction;
        const successfulResult = await omikujiMachine.omikuji(showOmikujiInActionMsg, OmikujiInActionMsg, omikujiList, chatter);

        if (omikujiSettings.settings.generalMessages.OmikujiSuccessful) {
            const OmikujiSuccessfulMsg = omikujiSettings.settings.generalMessages.OmikujiSuccessful
                .replace("{username}", username)
                .replace("{omikujiResult}", successfulResult)
                .replace("{displayName}", displayName);

            await twitchChat.sendChatMessage(OmikujiSuccessfulMsg, null, chatter);
        }

        activeOmikuji.del(username);

    }
};

function registerOmikujiCommand() {
    if (!commandManager.hasSystemCommand(OMIKUJI_COMMAND_ID)) {
        commandManager.registerSystemCommand(omikujiCommand);
    }
}

function unregisterOmikujiCommand() {
    commandManager.unregisterSystemCommand(OMIKUJI_COMMAND_ID);
}

function purgeCaches() {
    cooldownCache.flushAll();
    activeOmikuji.flushAll();
}

exports.purgeCaches = purgeCaches;
exports.registerOmikujiCommand = registerOmikujiCommand;
exports.unregisterOmikujiCommand = unregisterOmikujiCommand;