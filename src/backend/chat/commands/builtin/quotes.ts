import { app } from "electron";
import moment from "moment";

import { SystemCommand } from "../../../../types/commands";
import { Quote } from "../../../../types/quotes";
import { QuoteManager } from "../../../quotes/quote-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import * as cloudSync from "../../../cloud-sync";
import frontendCommunicator from "../../../common/frontend-communicator";
import logger from "../../../logwrapper";

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
        description: "チャットから引用を管理できます。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        baseCommandDescription: "ランダムな引用を表示",
        options: {
            quoteDisplayTemplate: {
                type: "string",
                title: "引用表示テンプレート",
                description: "チャットで引用をどう表示するか設定します。",
                tip: "変数: {id}, {text}, {author}, {game}, {date}",
                default: `引用 {id}: 「{text}」 - @{author} [{game}] [{date}]`,
                useTextArea: true
            },
            quoteDateFormat: {
                type: "enum",
                title: "引用の日付形式",
                description: "!quote と !quote editdate コマンドでの日付表示形式です。",
                options: [
                    "MM/DD/YYYY",
                    "DD/MM/YYYY"
                ],
                default: "MM/DD/YYYY"
            },
            useTTS: {
                type: "boolean",
                title: "引用を TTS で読み上げる",
                description: "引用を作成または検索したときに TTS で読み上げます。",
                default: false
            },
            defaultStreamerAttribution: {
                type: "boolean",
                title: "@ 指定がない場合は配信者の引用として追加する",
                description: "引用追加時に @username が含まれていない場合、配信者の引用として登録します。",
                default: false
            }
        },
        subCommands: [
            {
                id: "quotelookup",
                arg: "\\d+",
                regex: true,
                usage: "[quoteId]",
                description: "指定した ID の引用を表示します。"
            },
            {
                arg: "add",
                usage: "add [@username] [quoteText]",
                description: "新しい引用を追加します。",
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
                usage: "remove [quoteId]",
                description: "ID を指定して引用を削除します。",
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
                usage: "edittext [quoteId] [newText]",
                description: "指定した引用の本文を編集します。",
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
                usage: "edituser [quoteId] [newUsername]",
                description: "指定した引用の発言者を編集します。",
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
                usage: "editgame [quoteId] [newGame]",
                minArgs: 3,
                description: "指定した引用のゲーム名を編集します。",
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
                usage: "editdate [quoteId] [newDate]",
                minArgs: 3,
                description: "指定した引用の日付を編集します。",
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
                description: "引用一覧ページのリンクを表示します。"
            },
            {
                arg: "search",
                usage: "search [searchTerm]",
                minArgs: 2,
                description: "検索語に一致するランダムな引用を表示します。"
            },
            {
                arg: "searchuser",
                usage: "searchuser @username",
                minArgs: 2,
                description: "指定ユーザーのランダムな引用を表示します。"
            },
            {
                arg: "searchdate",
                usage: "searchdate DD MM YYYY",
                minArgs: 3,
                description: "指定日付のランダムな引用を表示します。"
            },
            {
                arg: "searchgame",
                usage: "searchgame [searchTerm]",
                minArgs: 2,
                description: "指定ゲームのランダムな引用を表示します。"
            }
        ]
    },
    /**
     * When the command is triggered
     */
    onTriggerEvent: async (event) => {
        const { commandOptions } = event;

        const args = event.userCommand.args;

        const getFormattedQuoteString = (quote: Quote) => {
            const prettyDate = quote.createdAt != null ? moment(quote.createdAt).format(commandOptions.quoteDateFormat) : "日付なし";
            return commandOptions.quoteDisplayTemplate
                .replaceAll("{id}", quote._id.toString())
                .replaceAll("{text}", quote.text)
                .replaceAll("{author}", quote.originator)
                .replaceAll("{game}", quote.game)
                .replaceAll("{date}", prettyDate);
        };

        const sendToTTS = (text: string) => {
            if (commandOptions.useTTS) {
                //Send to TTS
                frontendCommunicator.send("read-tts", {
                    text
                });
            }
        };

        if (args.length === 0) {
            // no args, only "!quote" was issued
            const quote = await QuoteManager.getRandomQuote();

            if (quote) {
                const formattedQuote = getFormattedQuoteString(quote);
                await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                sendToTTS(formattedQuote);

                logger.debug(`We pulled a quote by id: ${formattedQuote}`);
            } else {
                await TwitchApi.chat.sendChatMessage("ランダムな引用が見つかりませんでした。", null, true);
            }
            return;
        }

        const triggeredArg = args[0];

        if (event.userCommand.subcommandId === "quotelookup") {
            const quoteId = parseInt(triggeredArg);
            const quote = await QuoteManager.getQuote(quoteId);
            if (quote) {
                const formattedQuote = getFormattedQuoteString(quote);
                await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                sendToTTS(formattedQuote);
                logger.debug(`We pulled a quote using an id: ${formattedQuote}`);
            } else {
                await TwitchApi.chat.sendChatMessage("その ID の引用は見つかりませんでした。", null, true);
            }
            return;
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
                    await TwitchApi.chat.sendChatMessage("引用文を入力してください。", null, true);
                    return;
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
                const newQuoteId = await QuoteManager.addQuote(newQuote);
                const newQuoteText = await QuoteManager.getQuote(newQuoteId);
                const formattedQuote = getFormattedQuoteString(newQuoteText);
                await TwitchApi.chat.sendChatMessage(`引用を追加しました: ${formattedQuote}`, null, true);
                sendToTTS(formattedQuote);
                logger.debug(`Quote #${newQuoteId} added!`);
                return;
            }
            case "remove": {
                const quoteId = parseInt(args[1]);
                if (!isNaN(quoteId)) {
                    await QuoteManager.removeQuote(quoteId);
                    await TwitchApi.chat.sendChatMessage(`引用 ${quoteId} を削除しました。`, null, true);
                    logger.debug(`A quote was removed: ${quoteId}`);
                    return;
                }

                await TwitchApi.chat.sendChatMessage("その ID の引用は見つかりませんでした。", null, true);
                logger.error('Quotes: NaN passed to remove quote command.');
                return;
            }
            case "list": {
                const streamerName = await cloudSync.syncProfileData({
                    username: event.chatMessage.username,
                    userRoles: event.chatMessage.roles,
                    profilePage: 'quotes'
                });

                await TwitchApi.chat.sendChatMessage(`引用一覧はこちらです: https://firebot.app/profile/${streamerName}`, null, true);

                return;
            }
            case "search": {

                // strip first token("search") from input, and join the remaining using space as the delimiter
                const searchTerm = args.slice(1).join(" ");

                // attempt to get a random quote containing the text as an exact match
                const quote = await QuoteManager.getRandomQuoteContainingText(searchTerm);

                // quote found
                if (quote != null) {

                    // format quote
                    const formattedQuote = getFormattedQuoteString(quote);

                    // send to chat
                    await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                    sendToTTS(formattedQuote);

                    // log (Maybe move this to the manager?)
                    logger.debug(`We pulled a quote using an id: ${formattedQuote}`);

                    // no matching quote found
                } else {
                    await TwitchApi.chat.sendChatMessage("その検索条件に一致する引用は見つかりませんでした。", null, true);
                }

                // resolve promise
                return;
            }
            case "searchuser": {
                const username = args[1].replace("@", "");

                const quote = await QuoteManager.getRandomQuoteByAuthor(username);

                if (quote != null) {

                    const formattedQuote = getFormattedQuoteString(quote);
                    sendToTTS(formattedQuote);
                    await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                } else {
                    await TwitchApi.chat.sendChatMessage(`${username} の引用は見つかりませんでした。`, null, true);
                }
                return;
            }
            case "searchgame": {
                const searchTerm = args.slice(1).join(" ");
                const quote = await QuoteManager.getRandomQuoteByGame(searchTerm);
                if (quote != null) {
                    const formattedQuote = getFormattedQuoteString(quote);
                    await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                    sendToTTS(formattedQuote);
                } else {
                    await TwitchApi.chat.sendChatMessage(`ゲーム「${searchTerm}」の引用は見つかりませんでした。`, null, true);
                }
                return;
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
                    await TwitchApi.chat.sendChatMessage("引用の日付検索が正しくありません。", null, true);
                    return;
                }

                const quote = await QuoteManager.getRandomQuoteByDate({
                    day,
                    month,
                    year
                });

                if (quote != null) {
                    const formattedQuote = getFormattedQuoteString(quote);
                    await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                    sendToTTS(formattedQuote);
                } else {
                    await TwitchApi.chat.sendChatMessage(`${day}/${month}/${year || "*"} の引用は見つかりませんでした。`, null, true);
                }
                return;
            }
            case "edittext": {
                if (args.length < 3) {
                    await TwitchApi.chat.sendChatMessage(`使い方が正しくありません。${event.userCommand.trigger} edittext [quoteId] [newText]`, null, true);
                    return;
                }

                const quoteId = parseInt(args[1]);
                if (isNaN(quoteId)) {
                    await TwitchApi.chat.sendChatMessage("引用 ID が正しくありません。", null, true);
                    return;
                }

                const quote = await QuoteManager.getQuote(quoteId);

                if (quote == null) {
                    await TwitchApi.chat.sendChatMessage(`ID ${quoteId} の引用は見つかりませんでした。`, null, true);
                    return;
                }

                const newText = args.slice(2).join(" ");
                quote.text = newText;

                try {
                    await QuoteManager.updateQuote(quote);
                } catch {
                    await TwitchApi.chat.sendChatMessage(`引用 ${quoteId} の更新に失敗しました。`, null, true);
                    return;
                }

                const formattedQuote = getFormattedQuoteString(quote);

                await TwitchApi.chat.sendChatMessage(`引用を編集しました: ${formattedQuote}`, null, true);

                // resolve promise
                return;
            }
            case "editgame": {
                if (args.length < 3) {
                    await TwitchApi.chat.sendChatMessage(`使い方が正しくありません。${event.userCommand.trigger} editgame [quoteId] [newGame]`, null, true);
                    return;
                }

                const quoteId = parseInt(args[1]);
                if (isNaN(quoteId)) {
                    await TwitchApi.chat.sendChatMessage("引用 ID が正しくありません。", null, true);
                    return;
                }

                const quote = await QuoteManager.getQuote(quoteId);

                if (quote == null) {
                    await TwitchApi.chat.sendChatMessage(`ID ${quoteId} の引用は見つかりませんでした。`, null, true);
                    return;
                }

                const newGameName = args.slice(2).join(" ");
                quote.game = newGameName;

                try {
                    await QuoteManager.updateQuote(quote);
                } catch {
                    await TwitchApi.chat.sendChatMessage(`引用 ${quoteId} の更新に失敗しました。`, null, true);
                    return;
                }

                const formattedQuote = getFormattedQuoteString(quote);
                await TwitchApi.chat.sendChatMessage(`引用を編集しました: ${formattedQuote}`, null, true);

                // resolve promise
                return;
            }
            case "editdate": {

                const dateFormat = commandOptions.quoteDateFormat;

                if (args.length < 3) {
                    await TwitchApi.chat.sendChatMessage(`使い方が正しくありません。${event.userCommand.trigger} editdate [quoteId] ${dateFormat}`, null, true);
                    return;
                }

                const quoteId = parseInt(args[1]);
                if (isNaN(quoteId)) {
                    await TwitchApi.chat.sendChatMessage("引用 ID が正しくありません。", null, true);
                    return;
                }

                const quote = await QuoteManager.getQuote(quoteId);

                if (quote == null) {
                    await TwitchApi.chat.sendChatMessage(`ID ${quoteId} の引用は見つかりませんでした。`, null, true);
                    return;
                }

                const newDate = args.slice(2).join(" ");

                const date = moment(newDate, dateFormat);
                if (!date.isValid()) {
                    await TwitchApi.chat.sendChatMessage("日付形式が正しくありません。", null, true);
                    return;
                }

                quote.createdAt = date.toISOString();

                try {
                    await QuoteManager.updateQuote(quote);
                } catch {
                    await TwitchApi.chat.sendChatMessage(`引用 ${quoteId} の更新に失敗しました。`, null, true);
                    return;
                }

                const formattedQuote = getFormattedQuoteString(quote);
                await TwitchApi.chat.sendChatMessage(`引用を編集しました: ${formattedQuote}`, null, true);

                // resolve promise
                return;
            }
            case "edituser": {
                if (args.length < 3) {
                    await TwitchApi.chat.sendChatMessage(
                        `使い方が正しくありません。${event.userCommand.trigger} edituser [quoteId] [newUsername]`,
                        null,
                        true
                    );
                    return;
                }

                const quoteId = parseInt(args[1]);
                if (isNaN(quoteId)) {
                    await TwitchApi.chat.sendChatMessage("引用 ID が正しくありません。", null, true);
                    return;
                }

                const quote = await QuoteManager.getQuote(quoteId);

                if (quote == null) {
                    await TwitchApi.chat.sendChatMessage(`ID ${quoteId} の引用は見つかりませんでした。`, null, true);
                    return;
                }

                const newUser = args[2].replace(/@/g, "");
                quote.originator = newUser;

                try {
                    await QuoteManager.updateQuote(quote);
                } catch {
                    await TwitchApi.chat.sendChatMessage(`引用 ${quoteId} の更新に失敗しました。`, null, true);
                    return;
                }

                const formattedQuote = getFormattedQuoteString(quote);
                await TwitchApi.chat.sendChatMessage(`引用を編集しました: ${formattedQuote}`, null, true);

                // resolve promise
                return;
            }
            default: {
                // Fallback
                const quote = await QuoteManager.getRandomQuote();

                if (quote) {
                    const formattedQuote = getFormattedQuoteString(quote);
                    await TwitchApi.chat.sendChatMessage(formattedQuote, null, true);
                    sendToTTS(formattedQuote);

                    logger.debug(`We pulled a quote by id: ${formattedQuote}`);
                } else {
                    await TwitchApi.chat.sendChatMessage("ランダムな引用が見つかりませんでした。", null, true);
                }
            }
        }
    }
};