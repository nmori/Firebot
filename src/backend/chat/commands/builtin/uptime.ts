import { SystemCommand } from "../../../../types/commands";
import util from "../../../utility";
import chat from "../../twitch-chat";

/**
 * The `!uptime` command
 */
export const UptimeSystemCommand: SystemCommand<{
    uptimeDisplayTemplate: string;
}> = {
    definition: {
        id: "firebot:uptime",
        name: "配信時間",
        active: true,
        trigger: "!uptime",
        description: "チャットに配信している時間を表示します。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        options: {
            uptimeDisplayTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "updtimeの表示フォーマット",
                tip: "変数: {uptime}",
                default: `放送時間: {uptime}`,
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async (event) => {
        const uptimeString = await util.getUptime();
        const { commandOptions } = event;
        await chat.sendChatMessage(commandOptions.uptimeDisplayTemplate
            .replace("{uptime}", uptimeString));
    }
};