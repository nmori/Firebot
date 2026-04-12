import moment from "moment";
import NodeCache from "node-cache";

import type { SystemCommand } from "../../../../types/commands";

import { CommandManager } from "../../../chat/commands/command-manager";
import { GameManager } from "../../game-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import currencyManager from "../../../currency/currency-manager";
import logger from "../../../logwrapper";
import { humanizeTime } from "../../../utils";
import { lottery } from "./lottery-machine";

interface LotteryParticipant {
    username: string;
    displayName: string;
}

const activeLotteryUsers = new Map<string, LotteryParticipant>();
const cooldownCache = new NodeCache({ checkperiod: 5 });

let startedLottery = false;
let lotteryAmount = 1;

const LOTTERY_COMMAND_ID = "firebot:lottery";

const lotteryCommand: SystemCommand = {
    definition: {
        id: LOTTERY_COMMAND_ID,
        name: "抽選",
        active: true,
        trigger: "!lottery",
        description: "抽選をします",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
            {
                id: "lotteryStart",
                arg: "start",
                usage: "start [user]",
                description: "指定された人数の抽選を開始する",
                hideCooldowns: true,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: ["broadcaster", "mod"]
                        }
                    ]
                }
            },
            {
                id: "lotteryStop",
                arg: "stop",
                usage: "stop",
                description: "抽選を終了する",
                hideCooldowns: true,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: ["broadcaster", "mod"]
                        }
                    ]
                }
            },
            {
                id: "lotteryAbort",
                arg: "abort",
                usage: "abort",
                description: "抽選を取りやめる",
                hideCooldowns: true,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: ["broadcaster", "mod"]
                        }
                    ]
                }
            },
            {
                id: "lotteryCancel",
                arg: "cancel",
                usage: "cancel",
                description: "抽選参加を辞退する",
                hideCooldowns: true
            }
        ]
    },
    onTriggerEvent: async ({ userCommand, chatMessage }) => {
        const lotterySettings = GameManager.getGameSettings("firebot-lottery");
        const chatter = lotterySettings.settings.chatSettings.chatter as string;
        const sendAsBot = !chatter || chatter.toLowerCase() === "bot";
        const username = userCommand.commandSender;
        const displayName = chatMessage.userDisplayName;

        const wagerAmount = lotterySettings.settings.currencySettings.defaultWager as number;
        const currencyId = lotterySettings.settings.currencySettings.currencyId as string;
        const baseLotteryAmount = lotterySettings.settings.lotterySettings.LotterySpec as number;

        if (userCommand.subcommandId === "lotteryStart") {
            if (startedLottery === true) {
                await TwitchApi.chat.sendChatMessage("すでに抽選モード開始済みです。終了するには !lottery stop と入力してください", chatMessage.id, sendAsBot);
                return;
            }

            const triggeredArg = userCommand.args[1] ?? baseLotteryAmount?.toString() ?? "1";
            const parsedLotteryAmount = parseInt(triggeredArg, 10);

            if (isNaN(parsedLotteryAmount) || parsedLotteryAmount < 1) {
                await TwitchApi.chat.sendChatMessage("無効な人数です。開始するには1以上の数字を入力してください。", chatMessage.id, sendAsBot);
                return;
            }

            await TwitchApi.chat.sendChatMessage("抽選の受付を開始します", null, sendAsBot);
            startedLottery = true;
            lotteryAmount = parsedLotteryAmount;
            return;
        }

        if (userCommand.subcommandId === "lotteryStop") {
            if (startedLottery !== true) {
                await TwitchApi.chat.sendChatMessage("抽選モードを開始していません。開始するには !lottery start [人数] と入力してください", chatMessage.id, sendAsBot);
                return;
            }

            startedLottery = false;

            if (activeLotteryUsers.size > 0) {
                const successTemplate = (lotterySettings.settings.generalMessages.LotterySuccessful as string) ?? "";
                await lottery(
                    Array.from(activeLotteryUsers.keys()),
                    activeLotteryUsers,
                    lotteryAmount,
                    successTemplate,
                    sendAsBot
                );
            } else {
                await TwitchApi.chat.sendChatMessage("参加者がいないので当選者はいません", null, sendAsBot);
            }

            activeLotteryUsers.clear();
            return;
        }

        if (userCommand.subcommandId === "lotteryAbort") {
            if (startedLottery !== true) {
                await TwitchApi.chat.sendChatMessage("抽選モードを開始していません。開始するには !lottery start [人数] と入力してください", chatMessage.id, sendAsBot);
                return;
            }

            for (const key of activeLotteryUsers.keys()) {
                try {
                    await currencyManager.adjustCurrencyForViewer(key, currencyId, Math.abs(wagerAmount));
                } catch (error) {
                    logger.error(error);
                    await TwitchApi.chat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生しました。`, null, sendAsBot);
                }
            }

            await TwitchApi.chat.sendChatMessage("抽選を取りやめました", null, sendAsBot);
            startedLottery = false;
            activeLotteryUsers.clear();
            return;
        }

        if (userCommand.subcommandId === "lotteryCancel") {
            if (!activeLotteryUsers.has(username)) {
                await TwitchApi.chat.sendChatMessage("抽選に参加していません", chatMessage.id, sendAsBot);
                return;
            }

            try {
                await currencyManager.adjustCurrencyForViewer(username, currencyId, Math.abs(wagerAmount));
            } catch (error) {
                logger.error(error);
                await TwitchApi.chat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生しました。`, null, sendAsBot);
                return;
            }

            activeLotteryUsers.delete(username);
            await TwitchApi.chat.sendChatMessage("抽選辞退しました", chatMessage.id, sendAsBot);
            return;
        }

        if (startedLottery !== true) {
            await TwitchApi.chat.sendChatMessage("配信者が抽選を開始するのをお待ち下さい", chatMessage.id, sendAsBot);
            return;
        }

        if (activeLotteryUsers.has(username)) {
            if (lotterySettings.settings.generalMessages.alreadyLotteryning) {
                const alreadyLotteryningMsg = (lotterySettings.settings.generalMessages.alreadyLotteryning as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(alreadyLotteryningMsg, null, sendAsBot);
            }
            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime as moment.Moment)) {
            if (lotterySettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = humanizeTime(Math.abs(moment().diff(cooldownExpireTime as moment.Moment, "seconds")));
                const cooldownMsg = (lotterySettings.settings.generalMessages.onCooldown as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{timeRemaining}", timeRemainingDisplay)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(cooldownMsg, null, sendAsBot);
            }
            return;
        }

        let userBalance: number;
        try {
            userBalance = await currencyManager.getViewerCurrencyAmount(username, currencyId);
        } catch (error) {
            logger.error(error);
            userBalance = 0;
        }

        if (userBalance < wagerAmount) {
            if (lotterySettings.settings.generalMessages.notEnough) {
                const notEnoughMsg = (lotterySettings.settings.generalMessages.notEnough as string)
                    .replaceAll("{username}", username)
                    .replaceAll("{displayName}", displayName);

                await TwitchApi.chat.sendChatMessage(notEnoughMsg, null, sendAsBot);
            }
            return;
        }

        activeLotteryUsers.set(username, {
            username,
            displayName
        });

        const cooldownSecs = lotterySettings.settings.cooldownSettings.cooldown as number;
        if (cooldownSecs && cooldownSecs > 0) {
            const expireTime = moment().add(cooldownSecs, "seconds");
            cooldownCache.set(username, expireTime, cooldownSecs);
        }

        try {
            await currencyManager.adjustCurrencyForViewer(username, currencyId, 0 - Math.abs(wagerAmount));
        } catch (error) {
            logger.error(error);
            await TwitchApi.chat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生したため、キャンセルされました。`, null, sendAsBot);
            activeLotteryUsers.delete(username);
            return;
        }

        const lotteryInActionMsg = (lotterySettings.settings.generalMessages.LotteryInAction as string)
            .replaceAll("{username}", username)
            .replaceAll("{displayName}", displayName);

        if (lotterySettings.settings.generalMessages.LotteryInAction) {
            await TwitchApi.chat.sendChatMessage(lotteryInActionMsg, null, sendAsBot);
        }
    }
};

function registerLotteryCommand(): void {
    if (!CommandManager.hasSystemCommand(LOTTERY_COMMAND_ID)) {
        CommandManager.registerSystemCommand(lotteryCommand);
    }
}

function unregisterLotteryCommand(): void {
    CommandManager.unregisterSystemCommand(LOTTERY_COMMAND_ID);
}

function purgeCaches(): void {
    cooldownCache.flushAll();
    activeLotteryUsers.clear();
    startedLottery = false;
    lotteryAmount = 1;
}

export default {
    purgeCaches,
    registerLotteryCommand,
    unregisterLotteryCommand
};
