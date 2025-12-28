import { SystemCommand } from "../../../../../types/commands";
import Steam from "./steam-access";
import { TwitchApi } from "../../../../streaming-platforms/twitch/api";

/**
 * The `!steam` command
 */
export const SteamSystemCommand: SystemCommand<{
    outputTemplate: string;
    countryCode: string;
}> = {
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
            },
            countryCode: {
                type: "string",
                title: "国コード (任意)",
                tip: "2文字のISO-3166国コード。例: US, CA, SE, NO, JP",
                default: ""
            }
        }
    },
    onTriggerEvent: async (event) => {
        const { commandOptions } = event;
        let gameName = event.userCommand.args.join(" ").trim();
        let message = "その名前のSteamゲームは見つかりません";

        if (gameName == null || gameName.length < 1) {

            const channelData = await TwitchApi.channels.getChannelInformation();

            gameName = channelData && channelData.gameName ? channelData.gameName : "";
        }

        if (gameName != null && gameName !== "") {
            const gameDetails = await Steam.getSteamGameDetails(gameName, commandOptions.countryCode);

            if (gameDetails !== null) {
                message = commandOptions.outputTemplate
                    .replaceAll("{gameName}", gameDetails.name)
                    .replaceAll("{price}", gameDetails.price || "不明")
                    .replaceAll("{releaseDate}", gameDetails.releaseDate || "不明")
                    .replaceAll("{metaCriticScore}", gameDetails.score?.toString() || "不明")
                    .replaceAll("{steamUrl}", gameDetails.url)
                    .replaceAll("{steamShortDescription}", gameDetails.shortDescription || "不明");
            }
        }

        await TwitchApi.chat.sendChatMessage(message, null, true);
    }
};