"use strict";

const util = require("../../../utility");
const twitchChat = require("../../../chat/twitch-chat");
const twitchListeners = require("../../../chat/chat-listeners/twitch-chat-listeners");
const commandManager = require("../../../chat/commands/CommandManager");
const gameManager = require("../../game-manager");
const currencyDatabase = require("../../../database/currencyDatabase");
const customRolesManager = require("../../../roles/custom-roles-manager");
const teamRolesManager = require("../../../roles/team-roles-manager");
const twitchRolesManager = require("../../../../shared/twitch-roles");
const logger = require("../../../logwrapper");
const moment = require("moment");
const triviaHelper = require("./trivia-helper");
const NodeCache = require("node-cache");

let fiveSecTimeoutId;
let answerTimeoutId;
let currentQuestion = null;

function clearCurrentQuestion() {
    currentQuestion = null;
    if (fiveSecTimeoutId) {
        clearTimeout(fiveSecTimeoutId);
        fiveSecTimeoutId = null;
    }
    if (answerTimeoutId) {
        clearTimeout(answerTimeoutId);
        answerTimeoutId = null;
    }
}

twitchListeners.events.on("chat-message", async data => {
    /**@type {import("../../../chat/chat-helpers").FirebotChatMessage} */
    const chatMessage = data;
    if (!currentQuestion) {
        return;
    }
    const { username, question, wager, winningsMultiplier, currencyId, chatter } = currentQuestion;
    //ensure chat is from question user
    if (username !== chatMessage.username) {
        return;
    }
    //grab args
    const args = chatMessage.rawText.split(" ");
    if (args.length < 1) {
        return;
    }
    //insure number
    const firstArg = parseInt(args[0]);
    if (isNaN(firstArg)) {
        return;
    }
    // outside the answer bound
    if (firstArg < 1 || firstArg > question.answers.length) {
        return;
    }

    const isCorrect = firstArg === question.correctIndex;

    if (isCorrect) {
        const winnings = Math.floor(wager * winningsMultiplier);

        await currencyDatabase.adjustCurrencyForUser(username, currencyId, winnings);

        const currency = currencyDatabase.getCurrencyById(currencyId);

        await twitchChat.sendChatMessage(`${username}, 正解！ ${util.commafy(winnings)} ${currency.name} を手に入れた`, null, chatter);
    } else {
        await twitchChat.sendChatMessage(`残念! ${username}, 不正解。次回チャレンジしてね`, null, chatter);
    }
    clearCurrentQuestion();
});

const cooldownCache = new NodeCache({checkperiod: 5});

const TRIVIA_COMMAND_ID = "firebot:trivia";

const triviaCommand = {
    definition: {
        id: TRIVIA_COMMAND_ID,
        name: "Trivia",
        active: true,
        trigger: "!trivia",
        description: "トリビアで遊ぶ",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
            {
                id: "wagerAmount",
                arg: "\\d+",
                regex: true,
                usage: "[wager]",
                description: "指定された賭け金額でトリビアの質問を開始する",
                hideCooldowns: true
            }
        ]
    },
    onTriggerEvent: async event => {

        const { userCommand } = event;

        const triviaSettings = gameManager.getGameSettings("firebot-trivia");
        const chatter = triviaSettings.settings.chatSettings.chatter;

        if (event.userCommand.subcommandId === "wagerAmount") {

            const triggeredArg = userCommand.args[0];
            const wagerAmount = parseInt(triggeredArg);

            const username = userCommand.commandSender;

            if (currentQuestion) {
                if (currentQuestion.username === username) {
                    await twitchChat.sendChatMessage(`${username}, あなたはすでにトリビアを出題されている！`, null, chatter);
                    return;
                }
                await twitchChat.sendChatMessage(`${username}, 現在、他の方が質問に回答中です。回答が終わるまでお待ちください。`, null, chatter);
                return;
            }

            const cooldownExpireTime = cooldownCache.get(username);
            if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                await twitchChat.sendChatMessage(`${username}, 次の開催までお待ち下さい。残り時間: ${timeRemainingDisplay}`, null, chatter);
                return;
            }

            if (wagerAmount < 1) {
                await twitchChat.sendChatMessage(`${username}, 賭け金は0以上でなければなりません。`, null, chatter);
                return;
            }

            const minWager = triviaSettings.settings.currencySettings.minWager;
            if (minWager != null & minWager > 0) {
                if (wagerAmount < minWager) {
                    await twitchChat.sendChatMessage(`${username}, 賭け金の額は少なくとも ${minWager} 以上にしてください.`, null, chatter);
                    return;
                }
            }
            const maxWager = triviaSettings.settings.currencySettings.maxWager;
            if (maxWager != null & maxWager > 0) {
                if (wagerAmount > maxWager) {
                    await twitchChat.sendChatMessage(`${username}, 賭け金額は ${maxWager} 以下にしてください`, null, chatter);
                    return;
                }
            }

            const currencyId = triviaSettings.settings.currencySettings.currencyId;
            let userBalance;
            try {
                userBalance = await currencyDatabase.getUserCurrencyAmount(username, currencyId);
            } catch (error) {
                logger.error(error.message);
                userBalance = 0;
            }

            if (userBalance < wagerAmount) {
                await twitchChat.sendChatMessage(`${username}, 手持ち金額が足りません`, null, chatter);
                return;
            }

            const question = await triviaHelper.getQuestion(
                triviaSettings.settings.questionSettings.enabledCategories,
                triviaSettings.settings.questionSettings.enabledDifficulties,
                triviaSettings.settings.questionSettings.enabledTypes
            );

            if (question == null) {
                await twitchChat.sendChatMessage(`${username}, トリビアの問題が見つかりませんでした。賭け金は返却されました。`, null, chatter);
                return;
            }

            const cooldownSecs = triviaSettings.settings.cooldownSettings.cooldown;
            if (cooldownSecs && cooldownSecs > 0) {
                const expireTime = moment().add(cooldownSecs, 'seconds');
                cooldownCache.set(username, expireTime, cooldownSecs);
            }

            try {
                await currencyDatabase.adjustCurrencyForUser(username, currencyId, -Math.abs(wagerAmount));
            } catch (error) {
                logger.error(error.message);
                await twitchChat.sendChatMessage(`${username}, 残高から通貨を差し引く際にエラーが発生したため、トリビアはキャンセルされました。`, null, chatter);
                return;
            }

            const userCustomRoles = customRolesManager.getAllCustomRolesForViewer(username) || [];
            const userTeamRoles = await teamRolesManager.getAllTeamRolesForViewer(username) || [];
            const userTwitchRoles = (userCommand.senderRoles || [])
                .map(r => twitchRolesManager.mapTwitchRole(r))
                .filter(r => !!r);

            const allRoles = [
                ...userTwitchRoles,
                ...userTeamRoles,
                ...userCustomRoles
            ];

            // get the users winnings multiplier
            let winningsMultiplier = 1.25;

            const multiplierSettings = triviaSettings.settings.multiplierSettings;

            let winningsMultiplierSettings;
            if (question.difficulty === "easy") {
                winningsMultiplierSettings = multiplierSettings.easyMultipliers;
            }
            if (question.difficulty === "medium") {
                winningsMultiplierSettings = multiplierSettings.mediumMultipliers;
            }
            if (question.difficulty === "hard") {
                winningsMultiplierSettings = multiplierSettings.hardMultipliers;
            }

            if (winningsMultiplierSettings) {
                winningsMultiplier = winningsMultiplierSettings.base;

                for (const role of winningsMultiplierSettings.roles) {
                    if (allRoles.some(r => r.id === role.roleId)) {
                        winningsMultiplier = role.value;
                        break;
                    }
                }
            }

            currentQuestion = {
                username: username,
                question: question,
                wager: wagerAmount,
                winningsMultiplier: winningsMultiplier,
                currencyId: currencyId,
                chatter: chatter
            };

            const answerTimeout = triviaSettings.settings.questionSettings.answerTime;

            const questionMessage = `@${username} trivia (${question.difficulty}): ${question.question} ${question.answers.map((v, i) => `${i + 1}) ${v}`).join(" ")} [Chat the correct answer # within ${answerTimeout} secs]`;

            await twitchChat.sendChatMessage(questionMessage, null, chatter);

            fiveSecTimeoutId = setTimeout(async () => {
                if (currentQuestion == null || currentQuestion.username !== username) {
                    return;
                }
                await twitchChat.sendChatMessage(`@${username}, 5秒以内にお答えください...`, null, chatter);
            }, (answerTimeout - 6) * 1000);

            answerTimeoutId = setTimeout(async () => {
                if (currentQuestion == null || currentQuestion.username !== username) {
                    return;
                }
                await twitchChat.sendChatMessage(`@${username},回答は間に合わなかった！`, null, chatter);
                clearCurrentQuestion();
            }, answerTimeout * 1000);
        } else {
            const noWagerMessage = triviaSettings.settings.chatSettings.noWagerMessage
                .replace("{user}", userCommand.commandSender);
            await twitchChat.sendChatMessage(noWagerMessage, null, chatter);
        }
    }
};

function registerTriviaCommand() {
    if (!commandManager.hasSystemCommand(TRIVIA_COMMAND_ID)) {
        commandManager.registerSystemCommand(triviaCommand);
    }
}

function unregisterTriviaCommand() {
    commandManager.unregisterSystemCommand(TRIVIA_COMMAND_ID);
}

function purgeCaches() {
    cooldownCache.flushAll();
    clearCurrentQuestion();
}

exports.purgeCaches = purgeCaches;
exports.registerTriviaCommand = registerTriviaCommand;
exports.unregisterTriviaCommand = unregisterTriviaCommand;