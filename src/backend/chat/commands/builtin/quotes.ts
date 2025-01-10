import { app } from "electron";
import moment from "moment";

import { SystemCommand } from "../../../../types/commands";

moment.locale(app.getLocale());

/**
 * The `!quote` command
 */
export const QuotesManagementSystemCommand: SystemCommand<{
    quoteDisplayTemplate: string;
    quoteDateFormat: string;
    useTTS: boolean;
    defaultStreamerAttribution: boolean;
}> = {
    definition: {
        id: "firebot:quotesmanagement",
        name: "引用管理",
        active: true,
        trigger: "!quote",
        description: "チャットから引用管理を実施.",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        baseCommandDescription: "ランダムに引用表示する",
        options: {
            quoteDisplayTemplate: {
                type: "string",
                title: "引用テンプレートを表示",
                description: "チャットでの引用の表示方法.",
                tip: "変数: {id}, {text}, {author}, {game}, {date}",
                default: `Quote {id}: "{text}" - @{author} [{game}] [{date}]`,
                useTextArea: true
            },
            quoteDateFormat: {
                type: "enum",
                title: "引用テンプレートフォーマット",
                description: "!quote'コマンドと'!quote editdate'コマンドで日付をどのように表示するか。",
                options: [
                    "YYYY/MM/DD",
                    "MM/DD/YYYY",
                    "DD/MM/YYYY"
                ],
                default: "YYYY/MM/DD"
            },
            useTTS: {
                type: "boolean",
                title: "引用をTTSで読み上げる",
                description: "引用が作成されたり検索されたりするたびに、TTSが引用を読み上げる。.",
                default: false
            },
            defaultStreamerAttribution: {
                type: "boolean",
                title: "Attribute new quote to streamer if nobody is explicitly tagged with @",
                description: "If @username is not included when adding a quote, it is attributed to the streamer.",
                default: false
            }
        },
        subCommands: [
            {
                id: "quotelookup",
                arg: "\\d+",
                regex: true,
                usage: "[引用ID]",
                description: "指定されたIDの引用を表示します。"
            },
            {
                arg: "add",
                usage: "add [@ユーザ名] [引用文]",
                description: "引用を追加します",
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
                usage: "remove [引用ID]",
                description: "引用を削除します",
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
                usage: "edittext [引用ID] [新規文]",
                description: "引用文を編集する.",
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
                usage: "edituser [引用ID] [ユーザー名]",
                description: "指定された引用のユーザー名を編集する",
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
                usage: "editgame [引用ID] [ゲーム]",
                minArgs: 3,
                description: "指定された引用のゲームを編集します。",
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
                usage: "editdate [引用ID] [新規日付]",
                minArgs: 3,
                description: "引用の日付を編集する",
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
                description: "すべての引用をリスト表示します"
            },
            {
                arg: "search",
                usage: "search [検索文字]",
                minArgs: 2,
                description: "検索語句を使用して引用を表示します"
            },
            {
                arg: "searchuser",
                usage: "searchuser @ユーザ名",
                minArgs: 2,
                description: "指定されたユーザーによる引用を表示します"
            },
            {
                arg: "searchdate",
                usage: "searchdate DD MM YYYY",
                minArgs: 3,
                description: "指定された日付の引用を設定します"
            },
            {
                arg: "searchgame",
                usage: "searchgame [検索文字]",
                minArgs: 2,
                description: "指定されたゲームの引用を表示します"
            }
        ]
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: (event) => {
        return new Promise<void>(async (resolve) => {
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
                    await twitchChat.sendChatMessage(`引用は見つかりませんでした`);
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
                    await twitchChat.sendChatMessage(`そのIDの引用は見つかりませんでした`);
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
                        await twitchChat.sendChatMessage(`引用文を指定してください`);
                        return resolve();
                    }
                    // Once we've evaluated that the syntax is correct we make our API calls
                    const channelData = await TwitchApi.channels.getChannelInformation();
                    const currentGameName = channelData && channelData.gameName ? channelData.gameName : "不明なゲーム";

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
                        `追加しました： ${formattedQuote}`
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

                    await twitchChat.sendChatMessage(`その番号の引用が見つかりませんでした`);
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
                        await twitchChat.sendChatMessage("引用はありませｎ");
                    } else {
                        await twitchChat.sendChatMessage(`引用のリストはこちら： https://firebot.app/profile?id=${binId}`);
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

                        await twitchChat.sendChatMessage(`Sorry! We could not find a quote using those terms.`);
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
                        await twitchChat.sendChatMessage(`Sorry! We could not find a quote by ${username}`);
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
                        await twitchChat.sendChatMessage(`Sorry! We could not find a quote with game ${searchTerm}`);
                    }
                    return resolve();
                }
                case "searchdate": {
                    const rawDay = parseInt(args[1]);
                    const rawMonth = parseInt(args[2]);
                    const rawYear = parseInt(args[3]);

                    const day = !isNaN(rawDay) ? rawDay : null;
                    const month = !isNaN(rawMonth) ? rawMonth : null;
                    const year = !isNaN(rawYear) ? rawYear : null;

                    if (day == null || month == null || day > 31 || day < 1 ||
                    month > 12 || month < 1) {
                        await twitchChat.sendChatMessage(`日付が無効です`);
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
                        await twitchChat.sendChatMessage(`Sorry! We could not find a quote with date ${day}/${month}/${year || "*"}`);
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
                        await twitchChat.sendChatMessage(`IDが異なります`);
                        return resolve();
                    }

                    const quote = await quotesManager.getQuote(quoteId);

                    if (quote == null) {
                        await twitchChat.sendChatMessage(`ID ${quoteId} の引用が見つからない`);
                        return resolve();
                    }

                    const newText = args.slice(2).join(" ");
                    quote.text = newText;

                    try {
                        await quotesManager.updateQuote(quote);
                    } catch (err) {
                        await twitchChat.sendChatMessage(`${quoteId} を更新中にエラーがおきました`);
                        return resolve();
                    }

                    const formattedQuote = getFormattedQuoteString(quote);

                    await twitchChat.sendChatMessage(
                        `編集しました： ${formattedQuote}`
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
                        await twitchChat.sendChatMessage(`無効な引用ID`);
                        return resolve();
                    }

                    const quote = await quotesManager.getQuote(quoteId);

                    if (quote == null) {
                        await twitchChat.sendChatMessage(`${quoteId} をもつIDのものがみつからない`);
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
                        await twitchChat.sendChatMessage(`Could not find a quote with id ${quoteId}`);
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
                            `Could not find a quote with id ${quoteId}`);
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
