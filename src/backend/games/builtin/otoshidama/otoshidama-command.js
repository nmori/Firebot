"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const commandManager = require("../../../chat/commands/command-manager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const otoshidamaMachine = require("./otoshidama-machine");
const logger = require("../../../logwrapper");
const moment = require("moment");
const NodeCache = require("node-cache");

const activeOmikuji = new NodeCache({checkperiod: 2});
const cooldownCache = new NodeCache({checkperiod: 5});

const OTOSHIDAMA_COMMAND_ID = "firebot:otoshidama";

const otoshidamaCommand = {
    definition: {
        id: OTOSHIDAMA_COMMAND_ID,
        name: "お年玉をもらう",
        active: true,
        trigger: "!otoshidama",
        description: "お年玉をもらいます",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
        ]
    },
    onTriggerEvent: async (event) => {

        const { userCommand, chatMessage } = event;

        const otoshidamaSettings = gameManager.getGameSettings("firebot-otoshidama");
        const chatter = otoshidamaSettings.settings.chatSettings.chatter;
        const username = userCommand.commandSender;
        const displayName = chatMessage.userDisplayName;
        if (activeOmikuji.get(username)) {
            if (otoshidamaSettings.settings.generalMessages.alreadyOmikujining) {
                const alreadyOmikujiningMsg = otoshidamaSettings.settings.generalMessages.alreadyOmikujining
                    .replace("{username}", username)
                    .replace("{displayName}", displayName);

                await twitchChat.sendChatMessage(alreadyOmikujiningMsg, null, chatter);
            }

            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
            if (otoshidamaSettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                const cooldownMsg = otoshidamaSettings.settings.generalMessages.onCooldown
                    .replace("{username}", username)
                    .replace("{timeRemaining}", timeRemainingDisplay)
                    .replace("{displayName}", displayName);

                await twitchChat.sendChatMessage(cooldownMsg, null, chatter);
            }

            return;
        }

        const currencyId = otoshidamaSettings.settings.currencySettings.currencyId;
        activeOmikuji.set(username, true);

        const cooldownSecs = otoshidamaSettings.settings.cooldownSettings.cooldown;
        if (cooldownSecs && cooldownSecs > 0) {
            const expireTime = moment().add(cooldownSecs, 'seconds');
            cooldownCache.set(username, expireTime, cooldownSecs);
        }

        const otoshidamaList = otoshidamaSettings.settings.currencySettings.OmikujiSpec;
        const successfulResult = await otoshidamaMachine.otoshidama(otoshidamaList, chatter);

        if (otoshidamaSettings.settings.generalMessages.OmikujiSuccessful) {
            try {
                await currencyDatabase.adjustCurrencyForUser(username, currencyId, (successfulResult));
            } catch (error) {
                logger.error(error);
                await twitchChat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生したため、お年玉はキャンセルされました。`, null, chatter);
                activeOmikuji.del(username);
                return;
            }
            const currencyName = await currencyDatabase.getCurrencyById(currencyId).name;
            const OmikujiSuccessfulMsg = otoshidamaSettings.settings.generalMessages.OmikujiSuccessful
                .replace("{username}", username)
                .replace("{currencyName}", currencyName)
                .replace("{otoshidamaResult}", successfulResult)
                .replace("{displayName}", displayName);

            await twitchChat.sendChatMessage(OmikujiSuccessfulMsg, null, chatter);
        }

        activeOmikuji.del(username);

    }
};

function registerOmikujiCommand() {
    if (!commandManager.hasSystemCommand(OTOSHIDAMA_COMMAND_ID)) {
        commandManager.registerSystemCommand(otoshidamaCommand);
    }
}

function unregisterOmikujiCommand() {
    commandManager.unregisterSystemCommand(OTOSHIDAMA_COMMAND_ID);
}

function purgeCaches() {
    cooldownCache.flushAll();
    activeOmikuji.flushAll();
}

exports.purgeCaches = purgeCaches;
exports.registerOmikujiCommand = registerOmikujiCommand;
exports.unregisterOmikujiCommand = unregisterOmikujiCommand;