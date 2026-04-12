import moment from "moment";
import NodeCache from "node-cache";

import type { SystemCommand } from "../../../../types/commands";

import { CommandManager } from "../../../chat/commands/command-manager";
import { GameManager } from "../../game-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import currencyAccess from "../../../currency/currency-access";
import currencyManager from "../../../currency/currency-manager";
import logger from "../../../logwrapper";
import { humanizeTime } from "../../../utils";
import { otoshidama } from "./otoshidama-machine";

const activeOtoshidama = new NodeCache({ checkperiod: 2 });
const cooldownCache = new NodeCache({ checkperiod: 5 });

const OTOSHIDAMA_COMMAND_ID = "firebot:otoshidama";

const otoshidamaCommand: SystemCommand = {
    definition: {
        id: OTOSHIDAMA_COMMAND_ID,
        name: "お年玉をもらう",
        active: true,
        trigger: "!otoshidama",
        description: "お年玉をもらいます",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: []
    },
    onTriggerEvent: async ({ userCommand, chatMessage }) => {
        const otoshidamaSettings = GameManager.getGameSettings("firebot-otoshidama");
        const chatter = otoshidamaSettings.settings.chatSettings.chatter as string;
        const sendAsBot = !chatter || chatter.toLowerCase() === "bot";

        const username = userCommand.commandSender;
        const displayName = chatMessage.userDisplayName;

        if (activeOtoshidama.get(username)) {
            if (otoshidamaSettings.settings.generalMessages.alreadyOmikujining) {
                const alreadyOmikujiningMsg = (otoshidamaSettings.settings.generalMessages.alreadyOmikujining as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(alreadyOmikujiningMsg, null, sendAsBot);
            }

            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime as moment.Moment)) {
            if (otoshidamaSettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = humanizeTime(Math.abs(moment().diff(cooldownExpireTime as moment.Moment, "seconds")));
                const cooldownMsg = (otoshidamaSettings.settings.generalMessages.onCooldown as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{timeRemaining}", timeRemainingDisplay)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(cooldownMsg, null, sendAsBot);
            }

            return;
        }

        const currencyId = otoshidamaSettings.settings.currencySettings.currencyId as string;
        activeOtoshidama.set(username, true);

        const cooldownSecs = otoshidamaSettings.settings.cooldownSettings.cooldown as number;
        if (cooldownSecs && cooldownSecs > 0) {
            const expireTime = moment().add(cooldownSecs, "seconds");
            cooldownCache.set(username, expireTime, cooldownSecs);
        }

        const otoshidamaList = (otoshidamaSettings.settings.currencySettings.OmikujiSpec as string) ?? "";
        const successfulResult = await otoshidama(otoshidamaList);

        if (otoshidamaSettings.settings.generalMessages.OmikujiSuccessful) {
            try {
                await currencyManager.adjustCurrencyForViewer(username, currencyId, successfulResult);
            } catch (error) {
                logger.error(error);
                await TwitchApi.chat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生したため、お年玉はキャンセルされました。`, null, sendAsBot);
                activeOtoshidama.del(username);
                return;
            }

            const currencyName = currencyAccess.getCurrencyById(currencyId)?.name ?? "";
            const omikujiSuccessfulMsg = (otoshidamaSettings.settings.generalMessages.OmikujiSuccessful as string)
                .replaceAll("{username}", username)
                .replaceAll("{currencyName}", currencyName)
                .replaceAll("{otoshidamaResult}", successfulResult.toString())
                .replaceAll("{displayName}", displayName);

            await TwitchApi.chat.sendChatMessage(omikujiSuccessfulMsg, null, sendAsBot);
        }

        activeOtoshidama.del(username);
    }
};

function registerOmikujiCommand(): void {
    if (!CommandManager.hasSystemCommand(OTOSHIDAMA_COMMAND_ID)) {
        CommandManager.registerSystemCommand(otoshidamaCommand);
    }
}

function unregisterOmikujiCommand(): void {
    CommandManager.unregisterSystemCommand(OTOSHIDAMA_COMMAND_ID);
}

function purgeCaches(): void {
    cooldownCache.flushAll();
    activeOtoshidama.flushAll();
}

export default {
    purgeCaches,
    registerOmikujiCommand,
    unregisterOmikujiCommand
};
