import moment from "moment";
import NodeCache from "node-cache";

import type { SystemCommand } from "../../../../types/commands";

import { CommandManager } from "../../../chat/commands/command-manager";
import { GameManager } from "../../game-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import currencyAccess from "../../../currency/currency-access";
import currencyManager from "../../../currency/currency-manager";
import { humanizeTime } from "../../../utils";

interface ActiveBiddingInfo {
    active: boolean;
    currentBid: number;
    topBidder: string;
    topBidderDisplayName: string;
}

let activeBiddingInfo: ActiveBiddingInfo = {
    active: false,
    currentBid: 0,
    topBidder: "",
    topBidderDisplayName: ""
};

let bidTimer: NodeJS.Timeout;

const cooldownCache = new NodeCache({ checkperiod: 5 });
const BID_COMMAND_ID = "firebot:bid";

function purgeCaches(): void {
    cooldownCache.flushAll();
    activeBiddingInfo = {
        active: false,
        currentBid: 0,
        topBidder: "",
        topBidderDisplayName: ""
    };
}

function setNewHighBidder(
    username: string,
    userDisplayName: string,
    amount: number
): void {
    activeBiddingInfo.currentBid = amount;
    activeBiddingInfo.topBidder = username;
    activeBiddingInfo.topBidderDisplayName = userDisplayName;
}

async function stopBidding(chatter: string): Promise<void> {
    clearTimeout(bidTimer);
    const sendAsBot = !chatter || chatter.toLowerCase() === "bot";
    if (activeBiddingInfo.topBidder) {
        await TwitchApi.chat.sendChatMessage(
            `${activeBiddingInfo.topBidderDisplayName} が ${activeBiddingInfo.currentBid} で落札しました！`,
            null,
            sendAsBot
        );
    } else {
        await TwitchApi.chat.sendChatMessage(
            `入札者がいなかったため、落札者はいません！`,
            null,
            sendAsBot
        );
    }

    purgeCaches();
}

const bidCommand: SystemCommand = {
    definition: {
        id: BID_COMMAND_ID,
        name: "入札",
        active: true,
        trigger: "!bid",
        description: "視聴者が入札ゲームに参加できます。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
            {
                id: "bidStart",
                arg: "start",
                usage: "start [currencyAmount]",
                description: "指定金額で入札を開始します。",
                hideCooldowns: true,
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
                }
            },
            {
                id: "bidStop",
                arg: "stop",
                usage: "stop",
                description: "入札を手動停止します。最高額入札者が勝利します。",
                hideCooldowns: true,
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
                }
            },
            {
                id: "bidAmount",
                arg: "\\d+",
                regex: true,
                usage: "[currencyAmount]",
                description: "指定金額で入札に参加します。",
                hideCooldowns: true
            }
        ]
    },
    onTriggerEvent: async ({ chatMessage, userCommand }) => {
        const bidSettings = GameManager.getGameSettings("firebot-bid");
        const chatter = bidSettings.settings.chatSettings.chatter as string;
        const sendAsBot = !chatter || chatter.toLowerCase() === "bot";

        const currencyId = bidSettings.settings.currencySettings.currencyId as string;
        const currency = currencyAccess.getCurrencyById(currencyId);
        const currencyName = currency.name;

        if (userCommand.subcommandId === "bidStart") {
            const triggeredArg = userCommand.args[1];
            const bidAmount = parseInt(triggeredArg);

            if (isNaN(bidAmount)) {
                await TwitchApi.chat.sendChatMessage(
                    `無効な金額です。数字を入力して入札を開始してください。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (activeBiddingInfo.active !== false) {
                await TwitchApi.chat.sendChatMessage(
                    `すでに入札が進行中です。!bid stop で停止してください。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (bidAmount < (bidSettings.settings.currencySettings.minBid as number)) {
                await TwitchApi.chat.sendChatMessage(
                    `開始入札額は ${bidSettings.settings.currencySettings.minBid as number} より多くしてください。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            activeBiddingInfo = {
                active: true,
                currentBid: bidAmount,
                topBidder: "",
                topBidderDisplayName: ""
            };

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement as number;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            await TwitchApi.chat.sendChatMessage(
                `入札が ${bidAmount} ${currencyName} から始まりました。!bid ${minimumBidWithRaise} と入力して参加してください。`,
                null,
                sendAsBot
            );

            const timeLimit = (bidSettings.settings.timeSettings.timeLimit as number) * 60000;
            bidTimer = setTimeout(async () => {
                await stopBidding(chatter);
            }, timeLimit);

        } else if (userCommand.subcommandId === "bidStop") {
            await stopBidding(chatter);
        } else if (userCommand.subcommandId === "bidAmount") {

            const triggeredArg = userCommand.args[0];
            const bidAmount = parseInt(triggeredArg);
            const username = userCommand.commandSender;
            const userDisplayName = chatMessage?.userDisplayName ?? username;

            if (activeBiddingInfo.active === false) {
                await TwitchApi.chat.sendChatMessage(
                    `現在進行中の入札はありません。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const cooldownExpireTime = cooldownCache.get(username);
            if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
                const timeRemainingDisplay = humanizeTime(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                await TwitchApi.chat.sendChatMessage(
                    `最近入札しました！次の入札まで ${timeRemainingDisplay} 待ってください。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (activeBiddingInfo.topBidder === username) {
                await TwitchApi.chat.sendChatMessage(
                    "あなたはすでに最高入札者です。自分自身に入札することはできません。",
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (bidAmount < 1) {
                await TwitchApi.chat.sendChatMessage(
                    "入札額は0より多くしてください。",
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const minBid = bidSettings.settings.currencySettings.minBid as number;
            if (minBid != null && minBid > 0) {
                if (bidAmount < minBid) {
                    await TwitchApi.chat.sendChatMessage(
                        `入札額は ${minBid} ${currencyName} 以上にしてください。`,
                        chatMessage.id,
                        sendAsBot
                    );
                    return;
                }
            }

            const userBalance = await currencyManager.getViewerCurrencyAmount(username, currencyId);
            if (userBalance < bidAmount) {
                await TwitchApi.chat.sendChatMessage(
                    `${currencyName} が足りません！`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement as number;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            if (bidAmount < minimumBidWithRaise) {
                await TwitchApi.chat.sendChatMessage(
                    `${minimumBidWithRaise} ${currencyName} 以上で入札してください。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const previousHighBidder = activeBiddingInfo.topBidder;
            const previousHighBidAmount = activeBiddingInfo.currentBid;
            if (previousHighBidder != null && previousHighBidder !== "") {
                await currencyManager.adjustCurrencyForViewer(previousHighBidder, currencyId, previousHighBidAmount);
                await TwitchApi.chat.sendChatMessage(
                    `上回る入札がありました！${previousHighBidAmount} ${currencyName} が返金されました。`,
                    chatMessage.id,
                    sendAsBot
                );
            }

            await currencyManager.adjustCurrencyForViewer(username, currencyId, -Math.abs(bidAmount));
            const newTopBidWithRaise = bidAmount + raiseMinimum;
            await TwitchApi.chat.sendChatMessage(
                `${userDisplayName} が ${bidAmount} ${currencyName} で最高入札者になりました。入札するには !bid ${newTopBidWithRaise}（以上）と入力してください。`,
                null,
                sendAsBot
            );


            setNewHighBidder(username, userDisplayName, bidAmount);

            const cooldownSecs = bidSettings.settings.cooldownSettings.cooldown as number;
            if (cooldownSecs && cooldownSecs > 0) {
                const expireTime = moment().add(cooldownSecs, 'seconds');
                cooldownCache.set(username, expireTime, cooldownSecs);
            }
        } else {
            await TwitchApi.chat.sendChatMessage(
                `入札の使い方が正しくありません: ${userCommand.trigger} [入札額]`,
                chatMessage.id,
                sendAsBot
            );
        }
    }
};

function registerBidCommand(): void {
    if (!CommandManager.hasSystemCommand(BID_COMMAND_ID)) {
        CommandManager.registerSystemCommand(bidCommand);
    }
}

function unregisterBidCommand(): void {
    CommandManager.unregisterSystemCommand(BID_COMMAND_ID);
}

export default {
    purgeCaches,
    registerBidCommand,
    unregisterBidCommand
};