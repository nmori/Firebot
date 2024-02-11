import { DateTime } from "luxon";

import { SystemCommand } from "../../../../types/commands";
import twitchApi from "../../../twitch-api/api";
import chat from "../../twitch-chat";
import util from "../../../utility";

/**
 * The `!followage` command
 */
export const FollowAgeSystemCommand: SystemCommand<{
    displayTemplate: string;
}> = {
    definition: {
        id: "firebot:followage",
        name: "フォロー期間",
        active: true,
        trigger: "!followage",
        description: "ユーザーがチャンネルをフォローしている期間を表示します",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        options: {
            displayTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "フォローメッセージのフォーマット",
                tip: "変数: {user}, {followage}, {followdate}",
                default: `{user} は {followage} 前 ( {followdate} (UTC) )よりフォローしています`,
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async (event) => {
        const commandSender = event.userCommand.commandSender;
        const commandOptions = event.commandOptions;

        const rawFollowDate = await twitchApi.users.getFollowDateForUser(commandSender);

        if (rawFollowDate === null) {
            await chat.sendChatMessage(`${commandSender} はこのチャンネルをフォローしていません.`);
        } else {
            const followDate = DateTime.fromJSDate(rawFollowDate),
                now = DateTime.utc(),
                nowLocal = DateTime.now();

            const followAgeString = util.getDateDiffString(
                followDate.toJSDate(),
                now.toJSDate()
            );

            await chat.sendChatMessage(commandOptions.displayTemplate
                .replace("{user}", commandSender)
                .replace("{followage}", followAgeString)
                .replace("{followdate}", nowLocal.toFormat("YYYY/MMMM/DD HH:mm"))
            );
        }
    }
};