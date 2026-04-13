import { SystemCommand } from "../../../../types/commands";
import logger from "../../../logwrapper";
import { humanizeTime } from "../../../utils";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

/**
 * The `!marker` command
 */
export const MarkerSystemCommand: SystemCommand<{
    successTemplate: string;
    unableTemplate: string;
    errorTemplate: string;
}> = {
    definition: {
        id: "firebot:create-marker",
        name: "配信マーカー作成",
        active: true,
        trigger: "!marker",
        usage: "[マーカー名]",
        description: "配信マーカーを作成します。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        minArgs: 1,
        cooldown: {
            user: 0,
            global: 0
        },
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
        },
        options: {
            successTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "マーカー作成時に送信するチャットメッセージ。",
                tip: "変数: {timestamp}",
                default: `マーカーを {timestamp} に作成しました。`,
                useTextArea: true
            },
            unableTemplate: {
                type: "string",
                title: "作成不可テンプレート",
                description: "マーカーを作成できないときに送信するチャットメッセージ。",
                default: "配信マーカーを作成できませんでした。",
                useTextArea: true
            },
            errorTemplate: {
                type: "string",
                title: "エラーテンプレート",
                description: "マーカー作成時にエラーが発生したときに送信するチャットメッセージ。",
                default: "配信マーカーの作成に失敗しました。",
                useTextArea: true
            }
        }
    },
    onTriggerEvent: async ({ userCommand, commandOptions }) => {

        const { args } = userCommand;

        try {
            const marker = await TwitchApi.streams.createStreamMarker(args.join(" "));

            if (marker == null) {
                await TwitchApi.chat.sendChatMessage(commandOptions.unableTemplate, null, true);
                return;
            }
            await TwitchApi.chat.sendChatMessage(
                commandOptions.successTemplate
                    .replaceAll("{timestamp}", humanizeTime(marker.positionInSeconds, "simple")),
                null,
                true
            );
        } catch (error) {
            logger.error(`Error running !marker`, error);
            await TwitchApi.chat.sendChatMessage(commandOptions.errorTemplate, null, true);
        }
    }
};