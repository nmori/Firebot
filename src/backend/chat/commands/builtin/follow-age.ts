import { DateTime } from "luxon";

import { SystemCommand } from "../../../../types/commands";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import { getDateDiffString } from "../../../utils";

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
        description: "ユーザーがチャンネルをフォローしている期間を表示します。",
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
                description: "フォロー期間メッセージの表示形式",
                tip: "変数: {user}, {followage}, {followdate}",
                default: `{user} は {followdate} UTC にフォローしました（{followage}前）`,
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async (event) => {
        const commandSender = event.userCommand.commandSender;
        const commandOptions = event.commandOptions;

        const rawFollowDate = await TwitchApi.users.getFollowDateForUser(commandSender);

        if (rawFollowDate === null) {
            await TwitchApi.chat.sendChatMessage(`${commandSender} はこのチャンネルをフォローしていません。`, null, true);
        } else {
            const followDate = DateTime.fromJSDate(rawFollowDate),
                now = DateTime.utc();

            const followAgeString = getDateDiffString(
                followDate.toJSDate(),
                now.toJSDate()
            );

            await TwitchApi.chat.sendChatMessage(
                commandOptions.displayTemplate
                    .replaceAll("{user}", commandSender)
                    .replaceAll("{followage}", followAgeString)
                    .replaceAll("{followdate}", followDate.toFormat("dd MMMM yyyy HH:mm")),
                null,
                true
            );
        }
    }
};