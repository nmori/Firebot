"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const commandManager = require("../../../chat/commands/CommandManager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const moment = require("moment");
const NodeCache = require("node-cache");

let activeBiddingInfo = {
    "active": false,
    "currentBid": 0,
    "topBidder": ""
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

async function stopBidding(chatter) {
    clearTimeout(bidTimer);
    if (activeBiddingInfo.topBidder) {
        await twitchChat.sendChatMessage(`${activeBiddingInfo.topBidder} が ${activeBiddingInfo.currentBid} を落札した。`, null, chatter);
    } else {
        await twitchChat.sendChatMessage(`誰も入札しなかったので、勝者はいない！`, null, chatter);
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
    onTriggerEvent: async event => {
        const { chatMessage, userCommand } = event;

        const bidSettings = gameManager.getGameSettings("firebot-bid");
        const chatter = bidSettings.settings.chatSettings.chatter;

        const currencyId = bidSettings.settings.currencySettings.currencyId;
        const currency = currencyDatabase.getCurrencyById(currencyId);
        const currencyName = currency.name;

        if (event.userCommand.subcommandId === "bidStart") {
            const triggeredArg = userCommand.args[1];
            const bidAmount = parseInt(triggeredArg);

            if (isNaN(bidAmount)) {
                await twitchChat.sendChatMessage(`無効な金額です。入札を開始するには数字を入力してください。`, null, chatter, chatMessage.id);
                return;
            }

            if (activeBiddingInfo.active !== false) {
                await twitchChat.sendChatMessage(`すでに入札が行われています。 終了するには !bid stop と入力してください`, null, chatter, chatMessage.id);
                return;
            }

            if (bidAmount < bidSettings.settings.currencySettings.minBid) {
                await twitchChat.sendChatMessage(`スタート価格は、${bidSettings.settings.currencySettings.minBid} 以上必要です。 `, null, chatter, chatMessage.id);
                return;
            }

            activeBiddingInfo = {
                "active": true,
                "currentBid": bidAmount,
                "topBidder": ""
            };

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            await twitchChat.sendChatMessage(`${bidAmount} ${currencyName}で入札を開始しました。 !bid ${minimumBidWithRaise} と打つとで入札します`, null, chatter);

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

            if (activeBiddingInfo.active === false) {
                await twitchChat.sendChatMessage(`現在、入札は行われていません。`, null, chatter, chatMessage.id);
                return;
            }

            const cooldownExpireTime = cooldownCache.get(username);
            if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                await twitchChat.sendChatMessage(`次の入札開始をお待ちください 待ち時間： ${timeRemainingDisplay} `, null, chatter, chatMessage.id);
                return;
            }

            if (activeBiddingInfo.topBidder === username) {
                await twitchChat.sendChatMessage("あなたは最高入札者です。追加入札はできません。", null, chatter, chatMessage.id);
                return;
            }

            if (bidAmount < 1) {
                await twitchChat.sendChatMessage("入札金額は 0 より大きくしてください。", null, chatter, chatMessage.id);
                return;
            }

            const minBid = bidSettings.settings.currencySettings.minBid;
            if (minBid != null & minBid > 0) {
                if (bidAmount < minBid) {
                    await twitchChat.sendChatMessage(`入札額は少なくとも ${minBid} ${currencyName} 以上必要です.`, null, chatter, chatMessage.id);
                    return;
                }
            }

            const userBalance = await currencyDatabase.getUserCurrencyAmount(username, currencyId);
            if (userBalance < bidAmount) {
                await twitchChat.sendChatMessage(`${currencyName} が不足しています`, null, chatter, chatMessage.id);
                return;
            }

            const raiseMinimum = bidSettings.settings.currencySettings.minIncrement;
            const minimumBidWithRaise = activeBiddingInfo.currentBid + raiseMinimum;
            if (bidAmount < minimumBidWithRaise) {
                await twitchChat.sendChatMessage(`少なくとも ${minimumBidWithRaise} ${currencyName} は必要です.`, null, chatter, chatMessage.id);
                return;
            }

            const previousHighBidder = activeBiddingInfo.topBidder;
            const previousHighBidAmount = activeBiddingInfo.currentBid;
            if (previousHighBidder != null && previousHighBidder !== "") {
                await currencyDatabase.adjustCurrencyForUser(previousHighBidder, currencyId, previousHighBidAmount);
                await twitchChat.sendChatMessage(`落札されました！ ${previousHighBidAmount} ${currencyName} が返金されました.`, null, chatter, chatMessage.id);
            }

            await currencyDatabase.adjustCurrencyForUser(username, currencyId, -Math.abs(bidAmount));
            const newTopBidWithRaise = bidAmount + raiseMinimum;
            await twitchChat.sendChatMessage(`${username} が高値を更新しました。${bidAmount} ${currencyName}. 入札するには !bid ${newTopBidWithRaise} か、それ以上の額を入力してください`);

            // eslint-disable-next-line no-use-before-define
            setNewHighBidder(username, bidAmount);

            const cooldownSecs = bidSettings.settings.cooldownSettings.cooldown;
            if (cooldownSecs && cooldownSecs > 0) {
                const expireTime = moment().add(cooldownSecs, 'seconds');
                cooldownCache.set(username, expireTime, cooldownSecs);
            }
        } else {
            await twitchChat.sendChatMessage(`入札コマンドが不正です。使い方） ${userCommand.trigger} [金額]`, null, chatter, chatMessage.id);
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

function setNewHighBidder(username, amount) {
    activeBiddingInfo.currentBid = amount;
    activeBiddingInfo.topBidder = username;
}

exports.purgeCaches = purgeCaches;
exports.registerBidCommand = registerBidCommand;
exports.unregisterBidCommand = unregisterBidCommand;