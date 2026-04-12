"use strict";

const Steam = require("./steam-access");
const twitchChat = require("../../../twitch-chat");
const TwitchApi = require("../../../../twitch-api/api");

const steam = {
    definition: {
        id: "firebot:steam",
        name: "Steam 讀懃ｴ｢",
        active: true,
        trigger: "!steam",
        usage: "[game name]",
        description: "steam荳翫・繧ｲ繝ｼ繝縺ｫ髢｢縺吶ｋ諠・ｱ繧定｡ｨ遉ｺ縺励∪縺・,
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 5
        },
        options: {
            outputTemplate: {
                type: "string",
                title: "蜃ｺ蜉帙ユ繝ｳ繝励Ξ繝ｼ繝・,
                tip: "螟画焚: {gameName}, {price}, {releaseDate}, {metaCriticScore}, {steamUrl}, {steamShortDescription}",
                default: `{gameName} (萓｡譬ｼ: {price} - 逋ｺ螢ｲ: {releaseDate} - 蛻ｶ菴・ {metaCriticScore}) {steamUrl}`,
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async event => {
        const { commandOptions } = event;
        let gameName = event.userCommand.args.join(" ").trim();
        let message = "縺昴・蜷榊燕縺ｮSteam繧ｲ繝ｼ繝縺ｯ隕九▽縺九ｊ縺ｾ縺帙ｓ";

        if (gameName == null || gameName.length < 1) {

            const channelData = await TwitchApi.channels.getChannelInformation();

            gameName = channelData && channelData.gameName ? channelData.gameName : "";
        }

        if (gameName != null && gameName !== "") {
            const gameDetails = await Steam.getSteamGameDetails(gameName);

            if (gameDetails !== null) {
                message = commandOptions.outputTemplate
                    .replace("{gameName}", gameDetails.name)
                    .replace("{price}", gameDetails.price || "荳肴・")
                    .replace("{releaseDate}", gameDetails.releaseDate || "荳肴・")
                    .replace("{metaCriticScore}", gameDetails.score.toString() || "荳肴・")
                    .replace("{steamUrl}", gameDetails.url)
                    .replace("{steamShortDescription}", gameDetails.shortDescription || "荳肴・");
            }
        }

        await twitchChat.sendChatMessage(message);
    }
};

module.exports = steam;
