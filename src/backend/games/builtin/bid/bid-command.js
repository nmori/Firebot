"use strict";

const { humanizeTime } = require("../../../utils");
const commandManager = require("../../../chat/commands/command-manager");
const gameManager = require("../../game-manager");
const currencyAccess = require("../../../currency/currency-access").default;
const currencyManager = require("../../../currency/currency-manager");
const moment = require("moment");
const NodeCache = require("node-cache");
const { TwitchApi } = require("../../../streaming-platforms/twitch/api");

let activeBiddingInfo = {
    "active": false,
    "currentBid": 0,
    "topBidder": "",
    "topBidderDisplayName": ""
};
let bidTimer;
const cooldownCache = new NodeCache({checkperiod: 5});
const BID_COMMAND_ID = "firebot:bid";

function purgeCaches() {
    cooldownCache.flushAll();
    activeBiddingInfo = {
        "active": false,
        "currentBid": 0,
        "topBidder": ""
    };
}

function setNewHighBidder(username, userDisplayName, amount) {
    activeBiddingInfo.currentBid = amount;
    activeBiddingInfo.topBidder = username;
    activeBiddingInfo.topBidderDisplayName = userDisplayName;
}

async function stopBidding(chatter) {
    clearTimeout(bidTimer);
    const sendAsBot = !chatter || chatter.toLowerCase() === "bot";
    if (activeBiddingInfo.topBidder) {
        await twitchChat.sendChatMessage(`${activeBiddingInfo.topBidderDisplayName} が ${activeBiddingInfo.currentBid} を落札した。`, null, chatter);
        await TwitchApi.chat.sendChatMessage(
            `${activeBiddingInfo.topBidderDisplayName} has won the bidding with ${activeBiddingInfo.currentBid}!`,
            null,
            sendAsBot
        );
    } else {
        await TwitchApi.chat.sendChatMessage(
            `誰も入札しなかったので、勝者はいない`,
            null,
            sendAsBot
        );
    }

    purgeCaches();
}

const bidCommand = {
    definition: {
        id: BID_COMMAND_ID,
        name: "Bid",
        active: true,
        trigger: "!bid",
        description: "視聴者が入札ゲームに参加できるようにする。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
            {
                id: "bidStart",
                arg: "start",
                usage: "start [currencyAmount]",
                description: "指定された金額で入札を開始する。",
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
                description: "手動で入札を止める。最高額入札者が落札する。",
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
                description: "指定された金額で入札に参加する.",
                hideCooldowns: true
            }
        ]
    },
    onTriggerEvent: async (event) => {
        const { chatMessage, userCommand } = event;

        const bidSettings = gameManager.getGameSettings("firebot-bid");
        const chatter = bidSettings.settings.chatSettings.chatter;
        const sendAsBot = !chatter || chatter.toLowerCase() === "bot";

        const currencyId = bidSettings.settings.currencySettings.currencyId;
        const currency = currencyAccess.getCurrencyById(currencyId);
        const currencyName = currency.name;

        if (event.userCommand.subcommandId === "bidStart") {
            const triggeredArg = userCommand.args[1];
            const bidAmount = parseInt(triggeredArg);

            if (isNaN(bidAmount)) {
                await TwitchApi.chat.sendChatMessage(
                    `無効な金額です。入札を開始するには数字を入力してください。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (activeBiddingInfo.active !== false) {
                await TwitchApi.chat.sendChatMessage(
                    `すでに入札が行われています。 終了するには !bid stop と入力してください`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (bidAmount < bidSettings.settings.currencySettings.minBid) {
                await TwitchApi.chat.sendChatMessage(
                    `スタート価格は、${bidSettings.settings.currencySettings.minBid} 以上必要です。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            activeBiddingInfo = {
                "active": true,
                "currentBid": bidAmount,
                "topBidder": ""
            };

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            await TwitchApi.chat.sendChatMessage(
                `${bidAmount} ${currencyName}で入札を開始しました。 !bid ${minimumBidWithRaise} と打つとで入札します`,
                null,
                sendAsBot
            );

            const timeLimit = bidSettings.settings.timeSettings.timeLimit * 60000;
            bidTimer = setTimeout(async () => {
                await stopBidding(chatter);
            }, timeLimit);

        } else if (event.userCommand.subcommandId === "bidStop") {
            await stopBidding(chatter);
        } else if (event.userCommand.subcommandId === "bidAmount") {

            const triggeredArg = userCommand.args[0];
            const bidAmount = parseInt(triggeredArg);
            const username = userCommand.commandSender;
            const userDisplayName = chatMessage?.userDisplayName ?? username;

            if (activeBiddingInfo.active === false) {
                await TwitchApi.chat.sendChatMessage(
                    `現在、入札は行われていません。`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const cooldownExpireTime = cooldownCache.get(username);
            if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
                const timeRemainingDisplay = humanizeTime(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                await TwitchApi.chat.sendChatMessage(
                    `次の入札開始をお待ちください 待ち時間： ${timeRemainingDisplay} `,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (activeBiddingInfo.topBidder === username) {
                await TwitchApi.chat.sendChatMessage(
                    "あなたは最高入札者です。追加入札はできません。",
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            if (bidAmount < 1) {
                await TwitchApi.chat.sendChatMessage(
                    "入札金額は 0 より大きくしてください。",
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const minBid = bidSettings.settings.currencySettings.minBid;
            if (minBid != null && minBid > 0) {
                if (bidAmount < minBid) {
                    await TwitchApi.chat.sendChatMessage(
                        `入札額は少なくとも ${minBid} ${currencyName} 以上必要です.`,
                        chatMessage.id,
                        sendAsBot
                    );
                    return;
                }
            }

            const userBalance = await currencyManager.getViewerCurrencyAmount(username, currencyId);
            if (userBalance < bidAmount) {
                await TwitchApi.chat.sendChatMessage(
                    `${currencyName} が不足しています`,
                    chatMessage.id,
                    sendAsBot
                );
                return;
            }

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            if (bidAmount < minimumBidWithRaise) {
                await TwitchApi.chat.sendChatMessage(
                    `少なくとも ${minimumBidWithRaise} ${currencyName} は必要です.`,
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
                    `落札されました！ ${previousHighBidAmount} ${currencyName} が返金されました.`,
                    chatMessage.id,
                    sendAsBot
                );
            }

            await currencyManager.adjustCurrencyForViewer(username, currencyId, -Math.abs(bidAmount));
            const newTopBidWithRaise = bidAmount + raiseMinimum;
            await TwitchApi.chat.sendChatMessage(
                `${userDisplayName} が高値を更新しました。${bidAmount} ${currencyName}. 入札するには !bid ${newTopBidWithRaise} か、それ以上の額を入力してください`,
                null,
                sendAsBot
            );


            setNewHighBidder(username, userDisplayName, bidAmount);

            const cooldownSecs = bidSettings.settings.cooldownSettings.cooldown;
            if (cooldownSecs && cooldownSecs > 0) {
                const expireTime = moment().add(cooldownSecs, 'seconds');
                cooldownCache.set(username, expireTime, cooldownSecs);
            }
        } else {
            await TwitchApi.chat.sendChatMessage(
                `入札コマンドが不正です。使い方: ${userCommand.trigger} [bidAmount]`,
                chatMessage.id,
                sendAsBot
            );
        }
    }
};

function registerBidCommand() {
    if (!commandManager.hasSystemCommand(BID_COMMAND_ID)) {
        commandManager.registerSystemCommand(bidCommand);
    }
}

function unregisterBidCommand() {
    commandManager.unregisterSystemCommand(BID_COMMAND_ID);
}

exports.purgeCaches = purgeCaches;
exports.registerBidCommand = registerBidCommand;
exports.unregisterBidCommand = unregisterBidCommand;