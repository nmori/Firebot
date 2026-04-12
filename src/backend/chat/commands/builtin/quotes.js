"use strict";

const app = require('electron').app;

const moment = require("moment");
moment.locale(app.getLocale());

const quotesManagement = {
    definition: {
        id: "firebot:quotesmanagement",
        name: "蠑慕畑邂｡逅・,
        active: true,
        trigger: "!quote",
        description: "繝√Ε繝・ヨ縺九ｉ蠑慕畑邂｡逅・ｒ螳滓命.",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        baseCommandDescription: "繝ｩ繝ｳ繝繝縺ｫ蠑慕畑陦ｨ遉ｺ縺吶ｋ",
        options: {
            quoteDisplayTemplate: {
                type: "string",
                title: "蠑慕畑繝・Φ繝励Ξ繝ｼ繝医ｒ陦ｨ遉ｺ",
                description: "繝√Ε繝・ヨ縺ｧ縺ｮ蠑慕畑縺ｮ陦ｨ遉ｺ譁ｹ豕・",
                tip: "螟画焚: {id}, {text}, {author}, {game}, {date}",
                default: `Quote {id}: "{text}" - @{author} [{game}] [{date}]`,
                useTextArea: true
            },
            quoteDateFormat: {
                type: "enum",
                title: "蠑慕畑繝・Φ繝励Ξ繝ｼ繝医ヵ繧ｩ繝ｼ繝槭ャ繝・,
                description: "!quote'繧ｳ繝槭Φ繝峨→'!quote editdate'繧ｳ繝槭Φ繝峨〒譌･莉倥ｒ縺ｩ縺ｮ繧医≧縺ｫ陦ｨ遉ｺ縺吶ｋ縺九・,
                options: [
                    "YYYY/MM/DD",
                    "MM/DD/YYYY",
                    "DD/MM/YYYY"
                ],
                default: "YYYY/MM/DD"
            },
            useTTS: {
                type: "boolean",
                title: "蠑慕畑繧探TS縺ｧ隱ｭ縺ｿ荳翫￡繧・,
                description: "蠑慕畑縺御ｽ懈・縺輔ｌ縺溘ｊ讀懃ｴ｢縺輔ｌ縺溘ｊ縺吶ｋ縺溘・縺ｫ縲ゝTS縺悟ｼ慕畑繧定ｪｭ縺ｿ荳翫￡繧九・",
                default: false
            }
        },
        subCommands: [
            {
                id: "quotelookup",
                arg: "\\d+",
                regex: true,
                usage: "[蠑慕畑ID]",
                description: "謖・ｮ壹＆繧後◆ID縺ｮ蠑慕畑繧定｡ｨ遉ｺ縺励∪縺吶・
            },
            {
                arg: "add",
                usage: "add [@繝ｦ繝ｼ繧ｶ蜷江 [蠑慕畑譁Ⅹ",
                description: "蠑慕畑繧定ｿｽ蜉縺励∪縺・,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "mod",
                                "broadcaster"
                            ]
                        }
                    ]
                }
            },
            {
                arg: "remove",
                usage: "remove [蠑慕畑ID]",
                description: "蠑慕畑繧貞炎髯､縺励∪縺・,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "mod",
                                "broadcaster"
                            ]
                        }
                    ]
                }
            },
            {
                arg: "edittext",
                usage: "edittext [蠑慕畑ID] [譁ｰ隕乗枚]",
                description: "蠑慕畑譁・ｒ邱ｨ髮・☆繧・",
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "mod",
                                "broadcaster"
                            ]
                        }
                    ]
                }
            },
            {
                arg: "edituser",
                usage: "edituser [蠑慕畑ID] [繝ｦ繝ｼ繧ｶ繝ｼ蜷江",
                description: "謖・ｮ壹＆繧後◆蠑慕畑縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ蜷阪ｒ邱ｨ髮・☆繧・,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "mod",
                                "broadcaster"
                            ]
                        }
                    ]
                }
            },
            {
                arg: "editgame",
                usage: "editgame [蠑慕畑ID] [繧ｲ繝ｼ繝]",
                minArgs: 3,
                description: "謖・ｮ壹＆繧後◆蠑慕畑縺ｮ繧ｲ繝ｼ繝繧堤ｷｨ髮・＠縺ｾ縺吶・,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "mod",
                                "broadcaster"
                            ]
                        }
                    ]
                }
            },
            {
                arg: "editdate",
                usage: "editdate [蠑慕畑ID] [譁ｰ隕乗律莉肋",
                minArgs: 3,
                description: "蠑慕畑縺ｮ譌･莉倥ｒ邱ｨ髮・☆繧・,
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "mod",
                                "broadcaster"
                            ]
                        }
                    ]
                }
            },
            {
                arg: "list",
                usage: "list",
                description: "縺吶∋縺ｦ縺ｮ蠑慕畑繧偵Μ繧ｹ繝郁｡ｨ遉ｺ縺励∪縺・
            },
            {
                arg: "search",
                usage: "search [讀懃ｴ｢譁・ｭ余",
                minArgs: 2,
                description: "讀懃ｴ｢隱槫唱繧剃ｽｿ逕ｨ縺励※蠑慕畑繧定｡ｨ遉ｺ縺励∪縺・
            },
            {
                arg: "searchuser",
                usage: "searchuser @繝ｦ繝ｼ繧ｶ蜷・,
                minArgs: 2,
                description: "謖・ｮ壹＆繧後◆繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ繧医ｋ蠑慕畑繧定｡ｨ遉ｺ縺励∪縺・
            },
            {
                arg: "searchdate",
                usage: "searchdate DD MM YYYY",
                minArgs: 3,
                description: "謖・ｮ壹＆繧後◆譌･莉倥・蠑慕畑繧定ｨｭ螳壹＠縺ｾ縺・
            },
            {
                arg: "searchgame",
                usage: "searchgame [讀懃ｴ｢譁・ｭ余",
                minArgs: 2,
                description: "謖・ｮ壹＆繧後◆繧ｲ繝ｼ繝縺ｮ蠑慕畑繧定｡ｨ遉ｺ縺励∪縺・
            }
        ]
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: event => {
        return new Promise(async (resolve) => {
            const quotesManager = require("../../../quotes/quotes-manager");
            const logger = require("../../../../backend/logwrapper");
            const twitchChat = require("../../twitch-chat");
            const TwitchApi = require("../../../twitch-api/api");
            const frontendCommunicator = require("../../../common/frontend-communicator");

            const { commandOptions } = event;

            const args = event.userCommand.args;

            const getFormattedQuoteString = (quote) => {
                const prettyDate = quote.createdAt != null ? moment(quote.createdAt).format(commandOptions.quoteDateFormat) : "No Date";
                return commandOptions.quoteDisplayTemplate
                    .replace("{id}", quote._id)
                    .replace("{text}", quote.text)
                    .replace("{author}", quote.originator)
                    .replace("{game}", quote.game)
                    .replace("{date}", prettyDate);
            };

            const sendToTTS = (quote) => {
                if (commandOptions.useTTS) {
                    //Send to TTS
                    frontendCommunicator.send("read-tts", {
                        text: quote
                    });
                }
            };

            if (args.length === 0) {
                // no args, only "!quote" was issued
                const quote = await quotesManager.getRandomQuote();

                if (quote) {
                    const formattedQuote = getFormattedQuoteString(quote);
                    await twitchChat.sendChatMessage(formattedQuote);
                    sendToTTS(formattedQuote);

                    logger.debug(`We pulled a quote by id: ${formattedQuote}`);
                } else {
                    await twitchChat.sendChatMessage(`蠑慕畑縺ｯ隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆`);
                }
                return resolve();
            }

            const triggeredArg = args[0];

            if (event.userCommand.subcommandId === "quotelookup") {
                const quoteId = parseInt(triggeredArg);
                const quote = await quotesManager.getQuote(quoteId);
                if (quote) {
                    const formattedQuote = getFormattedQuoteString(quote);
                    await twitchChat.sendChatMessage(formattedQuote);
                    sendToTTS(formattedQuote);
                    logger.debug(`We pulled a quote using an id: ${formattedQuote}`);
                } else {
                    // If we get here, it's likely the command was used wrong. Tell the sender they done fucked up
                    await twitchChat.sendChatMessage(`縺昴・ID縺ｮ蠑慕畑縺ｯ隕九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆`);
                }
                return resolve();
            }

            switch (triggeredArg) {
                case "add": {
                    const shouldInsertStreamerUsername =
                        (commandOptions.defaultStreamerAttribution && args.length === 1) ||
                        (commandOptions.defaultStreamerAttribution && !args[1].includes("@"));
                    const expectedArgs = shouldInsertStreamerUsername
                        ? 2
                        : 3;

                    if (args.length < expectedArgs) {
                        await twitchChat.sendChatMessage(`蠑慕畑譁・ｒ謖・ｮ壹＠縺ｦ縺上□縺輔＞`);
                        return resolve();
                    }
                    // Once we've evaluated that the syntax is correct we make our API calls
                    const channelData = await TwitchApi.channels.getChannelInformation();
                    const currentGameName = channelData && channelData.gameName ? channelData.gameName : "荳肴・縺ｪ繧ｲ繝ｼ繝";

                    // If shouldInsertStreamerUsername and no @ is included in the originator arg, set originator @streamerName and treat the rest as the quote
                    if (shouldInsertStreamerUsername) {
                        args.splice(1, 0, `@${channelData.displayName}`);
                    }

                    const newQuote = {
                        text: args.slice(2, args.length).join(" "),
                        originator: args[1].replace(/@/g, ""),
                        creator: event.userCommand.commandSender,
                        game: currentGameName,
                        createdAt: moment().toISOString()
                    };
                    const newQuoteId = await quotesManager.addQuote(newQuote);
                    const newQuoteText = await quotesManager.getQuote(newQuoteId);
                    const formattedQuote = getFormattedQuoteString(newQuoteText);
                    await twitchChat.sendChatMessage(
                        `霑ｽ蜉縺励∪縺励◆・・${formattedQuote}`
                    );
                    sendToTTS(formattedQuote);
                    logger.debug(`Quote #${newQuoteId} added!`);
                    return resolve();
                }
                case "remove": {
                    const quoteId = parseInt(args[1]);
                    if (!isNaN(quoteId)) {
                        await quotesManager.removeQuote(quoteId);
                        await twitchChat.sendChatMessage(`Quote ${quoteId} was removed.`);
                        logger.debug(`A quote was removed: ${quoteId}`);
                        return resolve();
                    }

                    await twitchChat.sendChatMessage(`縺昴・逡ｪ蜿ｷ縺ｮ蠑慕畑縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縺ｧ縺励◆`);
                    logger.error('Quotes: NaN passed to remove quote command.');
                    return resolve();
                }
                case "list": {
                    const cloudSync = require('../../../cloud-sync/profile-sync');

                    const profileJSON = {
                        username: event.chatMessage.username,
                        userRoles: event.chatMessage.roles,
                        profilePage: 'quotes'
                    };

                    const binId = await cloudSync.syncProfileData(profileJSON);

                    if (binId == null) {
                        await twitchChat.sendChatMessage("蠑慕畑縺ｯ縺ゅｊ縺ｾ縺幢ｽ・);
                    } else {
                        await twitchChat.sendChatMessage(`蠑慕畑縺ｮ繝ｪ繧ｹ繝医・縺薙■繧会ｼ・https://firebot.app/profile?id=${binId}`);
                    }

                    return resolve();
                }
                case "search": {

                    // strip first token("search") from input, and join the remaining using space as the delimiter
                    const searchTerm = args.slice(1).join(" ");

                    // attempt to get a random quote containing the text as an exact match
                    const quote = await quotesManager.getRandomQuoteContainingText(searchTerm);

                    // quote found
                    if (quote != null) {

                        // format quote
                        const formattedQuote = getFormattedQuoteString(quote);

                        // send to chat
                        await twitchChat.sendChatMessage(formattedQuote);
                        sendToTTS(formattedQuote);

                        // log (Maybe move this to the manager?)
                        logger.debug(`We pulled a quote using an id: ${formattedQuote}`);

                        // no matching quote found
                    } else {

                        await twitchChat.sendChatMessage(`Sorry! We couldnt find a quote using those terms.`);
                    }

                    // resolve promise
                    return resolve();
                }
                case "searchuser": {
                    const username = args[1].replace("@", "");

                    const quote = await quotesManager.getRandomQuoteByAuthor(username);

                    if (quote != null) {

                        const formattedQuote = getFormattedQuoteString(quote);
                        sendToTTS(formattedQuote);
                        await twitchChat.sendChatMessage(formattedQuote);
                    } else {
                        await twitchChat.sendChatMessage(`Sorry! We couldn't find a quote by ${username}`);
                    }
                    return resolve();
                }
                case "searchgame": {
                    const searchTerm = args.slice(1).join(" ");
                    const quote = await quotesManager.getRandomQuoteByGame(searchTerm);
                    if (quote != null) {
                        const formattedQuote = getFormattedQuoteString(quote);
                        await twitchChat.sendChatMessage(formattedQuote);
                        sendToTTS(formattedQuote);
                    } else {
                        await twitchChat.sendChatMessage(`Sorry! We couldn't find a quote with game ${searchTerm}`);
                    }
                    return resolve();
                }
                case "searchdate": {
                    const day = !isNaN(args[1]) ? parseInt(args[1]) : null;
                    const month = !isNaN(args[2]) ? parseInt(args[2]) : null;
                    const year = !isNaN(args[3]) ? parseInt(args[3]) : null;

                    if (day == null || month == null || day > 31 || day < 1 ||
                    month > 12 || month < 1) {
                        await twitchChat.sendChatMessage(`譌･莉倥′辟｡蜉ｹ縺ｧ縺兪);
                        return resolve();
                    }

                    const quote = await quotesManager.getRandomQuoteByDate({
                        day,
                        month,
                        year
                    });

                    if (quote != null) {
                        const formattedQuote = getFormattedQuoteString(quote);
                        await twitchChat.sendChatMessage(formattedQuote);
                        sendToTTS(formattedQuote);
                    } else {
                        await twitchChat.sendChatMessage(`Sorry! We couldn't find a quote with date ${day}/${month}/${year || "*"}`);
                    }
                    return resolve();
                }
                case "edittext": {
                    if (args.length < 3) {
                        await twitchChat.sendChatMessage(`Invalid usage! ${event.userCommand.trigger} edittext [quoteId] [newText]`);
                        return resolve();
                    }

                    const quoteId = parseInt(args[1]);
                    if (isNaN(quoteId)) {
                        await twitchChat.sendChatMessage(`ID縺檎焚縺ｪ繧翫∪縺兪);
                        return resolve();
                    }

                    const quote = await quotesManager.getQuote(quoteId);

                    if (quote == null) {
                        await twitchChat.sendChatMessage(`ID ${quoteId} 縺ｮ蠑慕畑縺瑚ｦ九▽縺九ｉ縺ｪ縺Я);
                        return resolve();
                    }

                    const newText = args.slice(2).join(" ");
                    quote.text = newText;

                    try {
                        await quotesManager.updateQuote(quote);
                    } catch (err) {
                        await twitchChat.sendChatMessage(`${quoteId} 繧呈峩譁ｰ荳ｭ縺ｫ繧ｨ繝ｩ繝ｼ縺後♀縺阪∪縺励◆`);
                        return resolve();
                    }

                    const formattedQuote = getFormattedQuoteString(quote);

                    await twitchChat.sendChatMessage(
                        `邱ｨ髮・＠縺ｾ縺励◆・・${formattedQuote}`
                    );

                    // resolve promise
                    return resolve();
                }
                case "editgame": {
                    if (args.length < 3) {
                        await twitchChat.sendChatMessage(`Invalid usage! ${event.userCommand.trigger} editgame [quoteId] [newGame]`);
                        return resolve();
                    }

                    const quoteId = parseInt(args[1]);
                    if (isNaN(quoteId)) {
                        await twitchChat.sendChatMessage(`辟｡蜉ｹ縺ｪ蠑慕畑ID`);
                        return resolve();
                    }

                    const quote = await quotesManager.getQuote(quoteId);

                    if (quote == null) {
                        await twitchChat.sendChatMessage(`${quoteId} 繧偵ｂ縺､ID縺ｮ繧ゅ・縺後∩縺､縺九ｉ縺ｪ縺Я);
                        return resolve();
                    }

                    const newGameName = args.slice(2).join(" ");
                    quote.game = newGameName;

                    try {
                        await quotesManager.updateQuote(quote);
                    } catch (err) {
                        await twitchChat.sendChatMessage(`Failed to update quote ${quoteId}!`);
                        return resolve();
                    }

                    const formattedQuote = getFormattedQuoteString(quote);
                    await twitchChat.sendChatMessage(
                        `Edited ${formattedQuote}`
                    );

                    // resolve promise
                    return resolve();
                }
                case "editdate": {

                    const dateFormat = commandOptions.quoteDateFormat;

                    if (args.length < 3) {
                        await twitchChat.sendChatMessage(`Invalid usage! ${event.userCommand.trigger} editdate [quoteId] ${dateFormat}`);
                        return resolve();
                    }

                    const quoteId = parseInt(args[1]);
                    if (isNaN(quoteId)) {
                        await twitchChat.sendChatMessage(`Invalid Quote Id!`);
                        return resolve();
                    }

                    const quote = await quotesManager.getQuote(quoteId);

                    if (quote == null) {
                        await twitchChat.sendChatMessage(`Cannot find quote with id ${quoteId}`);
                        return resolve();
                    }

                    const newDate = args.slice(2).join(" ");

                    const date = moment(newDate, dateFormat);
                    if (!date.isValid()) {
                        await twitchChat.sendChatMessage(`Invalid date format!`);
                        return resolve();
                    }

                    quote.createdAt = date.toISOString();

                    try {
                        await quotesManager.updateQuote(quote);
                    } catch (err) {
                        await twitchChat.sendChatMessage(`Failed to update quote ${quoteId}!`);
                        return resolve();
                    }

                    const formattedQuote = getFormattedQuoteString(quote);
                    await twitchChat.sendChatMessage(
                        `Edited ${formattedQuote}`
                    );

                    // resolve promise
                    return resolve();
                }
                case "edituser": {
                    if (args.length < 3) {
                        await twitchChat.sendChatMessage(
                            `Invalid usage! ${event.userCommand.trigger} edituser [quoteId] [newUsername]`);
                        return resolve();
                    }

                    const quoteId = parseInt(args[1]);
                    if (isNaN(quoteId)) {
                        await twitchChat.sendChatMessage(
                            `Invalid Quote Id!`);
                        return resolve();
                    }

                    const quote = await quotesManager.getQuote(quoteId);

                    if (quote == null) {
                        await twitchChat.sendChatMessage(
                            `Cannot find quote with id ${quoteId}`);
                        return resolve();
                    }

                    const newUser = args[2].replace(/@/g, "");
                    quote.originator = newUser;

                    try {
                        await quotesManager.updateQuote(quote);
                    } catch (err) {
                        await twitchChat.sendChatMessage(
                            `Failed to update quote ${quoteId}!`);
                        return resolve();
                    }

                    const formattedQuote = getFormattedQuoteString(quote);
                    await twitchChat.sendChatMessage(
                        `Edited ${formattedQuote}`
                    );

                    // resolve promise
                    return resolve();
                }
                default: {

                    // Fallback
                    const quote = await quotesManager.getRandomQuote();

                    if (quote) {
                        const formattedQuote = getFormattedQuoteString(quote);
                        await twitchChat.sendChatMessage(formattedQuote);
                        sendToTTS(formattedQuote);

                        logger.debug(`We pulled a quote by id: ${formattedQuote}`);
                    } else {
                        await twitchChat.sendChatMessage(`Could not find a random quote!`);
                    }
                    return resolve();
                }
            }
        });
    }
};

module.exports = quotesManagement;
