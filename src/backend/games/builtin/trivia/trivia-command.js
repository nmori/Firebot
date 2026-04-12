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
    /**@type {import("../../../../types/chat").FirebotChatMessage} */
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

        await twitchChat.sendChatMessage(`${chatMessage.userDisplayName ?? username}, 豁｣隗｣・・${util.commafy(winnings)} ${currency.name} 繧呈焔縺ｫ蜈･繧後◆`, null, chatter);
    } else {
        await twitchChat.sendChatMessage(`Sorry ${chatMessage.userDisplayName ?? username}, 荳肴ｭ｣隗｣・・${postCorrectAnswer ? ` 豁｣隗｣縺ｯ ${question.answers[question.correctIndex - 1]}.` : ""} 谺｡蝗槭メ繝｣繝ｬ繝ｳ繧ｸ縺励※縺ｭ`, null, chatter);
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
        description: "繝医Μ繝薙い縺ｧ驕翫・",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        hideCooldowns: true,
        subCommands: [
            {
                id: "wagerAmount",
                arg: "\\d+",
                regex: true,
                usage: "[wager]",
                description: "謖・ｮ壹＆繧後◆雉ｭ縺鷹≡鬘阪〒繝医Μ繝薙い縺ｮ雉ｪ蝠上ｒ髢句ｧ九☆繧・,
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
                    await twitchChat.sendChatMessage(`${user.displayName}, 縺ゅ↑縺溘・縺吶〒縺ｫ繝医Μ繝薙い繧貞・鬘後＆繧後※縺・ｋ・～, null, chatter);
                    return;
                }
                await twitchChat.sendChatMessage(`${user.displayName}, 迴ｾ蝨ｨ縲∽ｻ悶・譁ｹ縺瑚ｳｪ蝠上↓蝗樒ｭ比ｸｭ縺ｧ縺吶ょ屓遲斐′邨ゅｏ繧九∪縺ｧ縺雁ｾ・■縺上□縺輔＞縲Ａ, null, chatter);
                return;
            }

            const cooldownExpireTime = cooldownCache.get(username);
            if (cooldownExpireTime && moment().isBefore(cooldownExpireTime)) {
                const timeRemainingDisplay = util.secondsForHumans(Math.abs(moment().diff(cooldownExpireTime, 'seconds')));
                await twitchChat.sendChatMessage(`${user.displayName}, 谺｡縺ｮ髢句ぎ縺ｾ縺ｧ縺雁ｾ・■荳九＆縺・よｮ九ｊ譎る俣: ${timeRemainingDisplay}`, null, chatter);
                return;
            }

            if (wagerAmount < 1) {
                await twitchChat.sendChatMessage(`${user.displayName}, 雉ｭ縺鷹≡縺ｯ0莉･荳翫〒縺ｪ縺代ｌ縺ｰ縺ｪ繧翫∪縺帙ｓ縲Ａ, null, chatter);
                return;
            }

            const minWager = triviaSettings.settings.currencySettings.minWager;
            if (minWager != null & minWager > 0) {
                if (wagerAmount < minWager) {
                    await twitchChat.sendChatMessage(`${user.displayName}, 雉ｭ縺鷹≡縺ｮ鬘阪・蟆代↑縺上→繧・${minWager} 莉･荳翫↓縺励※縺上□縺輔＞.`, null, chatter);
                    return;
                }
            }
            const maxWager = triviaSettings.settings.currencySettings.maxWager;
            if (maxWager != null & maxWager > 0) {
                if (wagerAmount > maxWager) {
                    await twitchChat.sendChatMessage(`${user.displayName}, 雉ｭ縺鷹≡鬘阪・ ${maxWager} 莉･荳九↓縺励※縺上□縺輔＞`, null, chatter);
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
                await twitchChat.sendChatMessage(`${user.displayName}, 謇区戟縺｡驥鷹｡阪′雜ｳ繧翫∪縺帙ｓ`, null, chatter);
                return;
            }

            const question = await triviaHelper.getQuestion(
                triviaSettings.settings.questionSettings.enabledCategories,
                triviaSettings.settings.questionSettings.enabledDifficulties,
                triviaSettings.settings.questionSettings.enabledTypes
            );

            if (question == null) {
                await twitchChat.sendChatMessage(`${user.displayName}, 繝医Μ繝薙い縺ｮ蝠城｡後′隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆縲りｳｭ縺鷹≡縺ｯ霑泌唆縺輔ｌ縺ｾ縺励◆縲Ａ, null, chatter);
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
                await twitchChat.sendChatMessage(`${user.displayName}, 谿矩ｫ倥°繧蛾夊ｲｨ繧貞ｷｮ縺怜ｼ輔￥髫帙↓繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺溘◆繧√√ヨ繝ｪ繝薙い縺ｯ繧ｭ繝｣繝ｳ繧ｻ繝ｫ縺輔ｌ縺ｾ縺励◆縲Ａ, null, chatter);
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
                await twitchChat.sendChatMessage(`@${user.displayName}, 5遘剃ｻ･蜀・↓縺顔ｭ斐∴縺上□縺輔＞...`, null, chatter);
            }, (answerTimeout - 6) * 1000);

            answerTimeoutId = setTimeout(async () => {
                if (currentQuestion == null || currentQuestion.username !== username) {
                    return;
                }
                await twitchChat.sendChatMessage(`@${user.displayName},蝗樒ｭ斐・髢薙↓蜷医ｏ縺ｪ縺九▲縺滂ｼ～, null, chatter);
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
