"use strict";

const Steam = require("./steam-access");
const twitchChat = require("../../../twitch-chat");
const TwitchApi = require("../../../../twitch-api/api");

const steam = {
    definition: {
        id: "firebot:steam",
        name: "Steam 検索",
        active: true,
        trigger: "!steam",
        usage: "[game name]",
        description: "steam上のゲームに関する情報を表示します",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 5
        },
        options: {
            outputTemplate: {
                type: "string",
                title: "出力テンプレート",
                tip: "変数: {gameName}, {price}, {releaseDate}, {metaCriticScore}, {steamUrl}, {steamShortDescription}",
                default: `{gameName} (価格: {price} - 発売: {releaseDate} - 制作: {metaCriticScore}) {steamUrl}`,
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async event => {
        const { commandOptions } = event;
        let gameName = event.userCommand.args.join(" ").trim();
        let message = "その名前のSteamゲームは見つかりません";

        if (gameName == null || gameName.length < 1) {

            const channelData = await TwitchApi.channels.getChannelInformation();

            gameName = channelData && channelData.gameName ? channelData.gameName : "";
        }

        if (gameName != null && gameName !== "") {
            const gameDetails = await Steam.getSteamGameDetails(gameName);

            if (gameDetails !== null) {
                message = commandOptions.outputTemplate
                    .replace("{gameName}", gameDetails.name)
                    .replace("{price}", gameDetails.price || "不明")
                    .replace("{releaseDate}", gameDetails.releaseDate || "不明")
                    .replace("{metaCriticScore}", gameDetails.score || "不明")
                    .replace("{steamUrl}", gameDetails.url)
                    .replace("{steamShortDescription}", gameDetails.shortDescription || "不明");
            }
        }

        await twitchChat.sendChatMessage(message);
    }
};

module.exports = steam;
