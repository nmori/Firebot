import moment from "moment";
import NodeCache from "node-cache";

import type { SystemCommand } from "../../../../types/commands";

import { CommandManager } from "../../../chat/commands/command-manager";
import { GameManager } from "../../game-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import currencyManager from "../../../currency/currency-manager";
import logger from "../../../logwrapper";
import { humanizeTime } from "../../../utils";
import { omikuji } from "./omikuji-machine";

const activeOmikuji = new NodeCache({ checkperiod: 2 });
const cooldownCache = new NodeCache({ checkperiod: 5 });

const OMIKUJI_COMMAND_ID = "firebot:omikuji";

const omikujiCommand: SystemCommand = {
    definition: {
        id: OMIKUJI_COMMAND_ID,
        name: "おみくじをひく",
        active: true,
        trigger: "!omikuji",
        description: "おみくじを開始します",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: []
    },
    onTriggerEvent: async ({ userCommand, chatMessage }) => {
        const omikujiSettings = GameManager.getGameSettings("firebot-omikuji");
        const chatter = omikujiSettings.settings.chatSettings.chatter as string;
        const sendAsBot = !chatter || chatter.toLowerCase() === "bot";

        const username = userCommand.commandSender;
        const displayName = chatMessage.userDisplayName;
        const wagerAmount = (omikujiSettings.settings.currencySettings.defaultWager as number) || 0;

        if (activeOmikuji.get(username)) {
            if (omikujiSettings.settings.generalMessages.alreadyOmikujining) {
                const alreadyOmikujiningMsg = (omikujiSettings.settings.generalMessages.alreadyOmikujining as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(alreadyOmikujiningMsg, null, sendAsBot);
            }

            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime as moment.Moment)) {
            if (omikujiSettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = humanizeTime(Math.abs(moment().diff(cooldownExpireTime as moment.Moment, "seconds")));
                const cooldownMsg = (omikujiSettings.settings.generalMessages.onCooldown as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{timeRemaining}", timeRemainingDisplay)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(cooldownMsg, null, sendAsBot);
            }

            return;
        }

        const currencyId = omikujiSettings.settings.currencySettings.currencyId as string;

        let userBalance: number;
        try {
            userBalance = await currencyManager.getViewerCurrencyAmount(username, currencyId);
        } catch (error) {
            logger.error(error);
            userBalance = 0;
        }

        if (userBalance < wagerAmount) {
            if (omikujiSettings.settings.generalMessages.notEnough) {
                const notEnoughMsg = (omikujiSettings.settings.generalMessages.notEnough as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(notEnoughMsg, null, sendAsBot);
            }

            return;
        }

        activeOmikuji.set(username, true);

        const cooldownSecs = omikujiSettings.settings.cooldownSettings.cooldown as number;
        if (cooldownSecs && cooldownSecs > 0) {
            const expireTime = moment().add(cooldownSecs, "seconds");
            cooldownCache.set(username, expireTime, cooldownSecs);
        }

        try {
            await currencyManager.adjustCurrencyForViewer(username, currencyId, 0 - Math.abs(wagerAmount));
        } catch (error) {
            logger.error(error);
            await TwitchApi.chat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生したため、おみくじはキャンセルされました。`, null, sendAsBot);
            activeOmikuji.del(username);
            return;
        }

        const omikujiInActionMsg = (omikujiSettings.settings.generalMessages.OmikujiInAction as string)
            ?.replaceAll("{username}", username)
            ?.replaceAll("{displayName}", displayName);

        const omikujiList = (omikujiSettings.settings.omikujiSettings.OmikujiSpec as string) ?? "";
        const showOmikujiInActionMsg = !!omikujiSettings.settings.generalMessages.OmikujiInAction;
        const successfulResult = await omikuji(showOmikujiInActionMsg, omikujiInActionMsg, omikujiList, sendAsBot);

        if (omikujiSettings.settings.generalMessages.OmikujiSuccessful) {
            const omikujiSuccessfulMsg = (omikujiSettings.settings.generalMessages.OmikujiSuccessful as string)
                .replaceAll("{username}", username)
                .replaceAll("{omikujiResult}", successfulResult)
                .replaceAll("{displayName}", displayName);

            await TwitchApi.chat.sendChatMessage(omikujiSuccessfulMsg, null, sendAsBot);
        }

        activeOmikuji.del(username);
    }
};

function registerOmikujiCommand(): void {
    if (!CommandManager.hasSystemCommand(OMIKUJI_COMMAND_ID)) {
        CommandManager.registerSystemCommand(omikujiCommand);
    }
}

function unregisterOmikujiCommand(): void {
    CommandManager.unregisterSystemCommand(OMIKUJI_COMMAND_ID);
}

function purgeCaches(): void {
    cooldownCache.flushAll();
    activeOmikuji.flushAll();
}

export default {
    purgeCaches,
    registerOmikujiCommand,
    unregisterOmikujiCommand
};
