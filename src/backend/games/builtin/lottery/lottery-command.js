"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const commandManager = require("../../../chat/commands/command-manager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const lotteryMachine = require("./lottery-machine");
const logger = require("../../../logwrapper");
const moment = require("moment");
const NodeCache = require("node-cache");

const activeLottery = new NodeCache({checkperiod: 2});
const cooldownCache = new NodeCache({checkperiod: 5});

const LOTTERY_COMMAND_ID = "firebot:lottery";

const lotteryCommand = {
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
                            roleIds: [
                                "broadcaster",
                                "mod"
                            ]
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
                            roleIds: [
                                "broadcaster",
                                "mod"
                            ]
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
                            roleIds: [
                                "broadcaster",
                                "mod"
                            ]
                        }
                    ]
                }
            },
            {
                id: "lotteryCancel",
                arg: "cancel",
                usage: "cancel",
                description: "抽選参加を辞退する",
                hideCooldowns: true,
            }
        ]
    },
    onTriggerEvent: async (event) => {

        const { userCommand, chatMessage } = event;

        const lotterySettings = gameManager.getGameSettings("firebot-lottery");
        const chatter = lotterySettings.settings.chatSettings.chatter;
        const username = userCommand.commandSender;
        const displayName = chatMessage.userDisplayName;

        const wagerAmount = lotterySettings.settings.currencySettings.defaultWager;
        const currencyId = lotterySettings.settings.currencySettings.currencyId;

        const baseLotteryAmount = lotterySettings.settings.lotterySettings.LotterySpec;


        if (event.userCommand.subcommandId === "lotteryStart") {
            if (lotteryMachine.startedLottery === true) {
                await twitchChat.sendChatMessage(`すでに抽選モード開始済みです。 終了するには !lottery stop と入力してください`, null, chatter, chatMessage.id);
                return;
            }
            const triggeredArg = userCommand.args[1] ?? baseLotteryAmount;
            const lotteryAmount = parseInt(triggeredArg);

            if (isNaN(lotteryAmount) || lotteryAmount < 1) {
                await twitchChat.sendChatMessage(`無効な人数です。開始するには1以上の数字を入力してください。`, null, chatter, chatMessage.id);
                return;
            }

            await twitchChat.sendChatMessage(`抽選の受付を開始します`, null, chatter);
            lotteryMachine.startedLottery =true;
            lotteryMachine.lotteryAmount = lotteryAmount;
            return;
        }
        else if (event.userCommand.subcommandId === "lotteryStop") {
            if (lotteryMachine.startedLottery !== true) {
                await twitchChat.sendChatMessage(`抽選モードを開始していません。 開始するには !lottery start [人数] と入力してください`, null, chatter, chatMessage.id);
                return;
            }

            if (activeLottery.keys().length > 0) {
                lotteryMachine.startedLottery = false;
                await lotteryMachine.lottery(activeLottery, lotterySettings.settings.generalMessages.LotterySuccessful, chatter);
            } else {
                await twitchChat.sendChatMessage(`参加者が居ないので当選者はいません`, null, chatter);
            }
            //終了処理
            activeLottery.flushAll();
            return;
        } else if (event.userCommand.subcommandId === "lotteryAbort") {
            if (lotteryMachine.startedLottery !== true) {
                await twitchChat.sendChatMessage(`抽選モードを開始していません。 開始するには !lottery start [人数] と入力してください`, null, chatter, chatMessage.id);
                return;
            }
            activeLottery.keys().forEach(async (key) => 
            {
                try {
                    await currencyDatabase.adjustCurrencyForUser(key, currencyId, -Math.abs(wagerAmount));
                } catch (error) {
                    logger.error(error);
                    await twitchChat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生しました。`, null, chatter);
                }
            });

            await twitchChat.sendChatMessage(`抽選を取りやめました`, null, chatter);

            //終了処理
            lotteryMachine.startedLottery =false;
            activeLottery.flushAll();
            return;

        } else if (event.userCommand.subcommandId === "lotteryCancel") {
            if (!activeLottery.get(username)) {
                await twitchChat.sendChatMessage(`抽選に参加していません`, null, chatter, chatMessage.id);
                return;
            }

            //返金
            try {
                await currencyDatabase.adjustCurrencyForUser(username, currencyId, Math.abs(wagerAmount));
            } catch (error) {
                logger.error(error);
                await twitchChat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生しました。`, null, chatter);
                return;
            }

            activeLottery.del(username);
            await twitchChat.sendChatMessage(`抽選辞退しました`, null, chatter, chatMessage.id);
            return;

        } else if (lotteryMachine.startedLottery !== true) {
            //一般ユーザが参加しようとしたとき
            await twitchChat.sendChatMessage(`配信者が抽選を開始するのをお待ち下さい`, null, chatter, chatMessage.id);
            return;
        }

        if (activeLottery.get(username)?.active) {
            if (lotterySettings.settings.generalMessages.alreadyLotteryning) {
                const alreadyLotteryningMsg = lotterySettings.settings.generalMessages.alreadyLotteryning
                    .replace("{username}", username)
                    .replace("{displayName}", displayName);

                await twitchChat.sendChatMessage(alreadyLotteryningMsg, null, chatter);
            }

            return;
        }

        const cooldownExpireTime = cooldownCache.get(username);
        if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
            if (lotterySettings.settings.generalMessages.onCooldown) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                const cooldownMsg = lotterySettings.settings.generalMessages.onCooldown
                    .replace("{username}", username)
                    .replace("{timeRemaining}", timeRemainingDisplay)
                    .replace("{displayName}", displayName);

                await twitchChat.sendChatMessage(cooldownMsg, null, chatter);
            }

            return;
        }

        let userBalance;
        try {
            userBalance = await currencyDatabase.getUserCurrencyAmount(username, currencyId);
        } catch (error) {
            logger.error(error);
            userBalance = 0;
        }

        if (userBalance < wagerAmount) {
            if (lotterySettings.settings.generalMessages.notEnough) {
                const notEnoughMsg = lotterySettings.settings.generalMessages.notEnough
                    .replace("{username}", username)
                    .replace("{displayName}", displayName);

                await twitchChat.sendChatMessage(notEnoughMsg, null, chatter);
            }

            return;
        }

        activeLottery.set(username,{active:true,username:username,displayName:displayName});

        const cooldownSecs = lotterySettings.settings.cooldownSettings.cooldown;
        if (cooldownSecs && cooldownSecs > 0) {
            const expireTime = moment().add(cooldownSecs, 'seconds');
            cooldownCache.set(username, expireTime, cooldownSecs);
        }

        try {
            await currencyDatabase.adjustCurrencyForUser(username, currencyId, -Math.abs(wagerAmount));
        } catch (error) {
            logger.error(error);
            await twitchChat.sendChatMessage(`${displayName}さん, 通貨処理にエラーが発生したため、キャンセルされました。`, null, chatter);
            activeLottery.del(username);
            return;
        }

        const LotteryInActionMsg = lotterySettings.settings.generalMessages.LotteryInAction
            .replace("{username}", username)
            .replace("{displayName}", displayName);

        const showLotteryInActionMsg = !!lotterySettings.settings.generalMessages.LotteryInAction;

        if (showLotteryInActionMsg) {
            await twitchChat.sendChatMessage(LotteryInActionMsg, null, chatter);
        }
    }
};

function registerLotteryCommand() {
    if (!commandManager.hasSystemCommand(LOTTERY_COMMAND_ID)) {
        commandManager.registerSystemCommand(lotteryCommand);
    }
}

function unregisterLotteryCommand() {
    commandManager.unregisterSystemCommand(LOTTERY_COMMAND_ID);
}

function purgeCaches() {
    cooldownCache.flushAll();
    activeLottery.flushAll();
    lotteryMachine.startedLottery = false;
    lotteryMachine.lotteryAmount=1;
}

exports.purgeCaches = purgeCaches;
exports.registerLotteryCommand = registerLotteryCommand;
exports.unregisterLotteryCommand = unregisterLotteryCommand;