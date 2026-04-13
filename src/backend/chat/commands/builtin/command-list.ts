import { SystemCommand } from "../../../../types/commands";
import * as cloudSync from '../../../cloud-sync';
import { SortTagManager } from "../../../sort-tags/sort-tag-manager";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";

/**
 * The `!commands` command
 */
export const CommandListSystemCommand: SystemCommand<{
    successTemplate: string;
    noCommandsTemplate: string;
    defaultTag?: string;
}> = {
    definition: {
        id: "firebot:commandlist",
        name: "コマンド一覧",
        active: true,
        trigger: "!commands",
        description: "利用可能なコマンド一覧があるプロフィールページへのリンクを表示します。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 0
        },
        options: {
            successTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "プロフィールページへのリンクと一緒に送信するチャットメッセージ。",
                tip: "変数: {url}",
                default: `コマンド一覧はこちらです: {url}`,
                useTextArea: true
            },
            noCommandsTemplate: {
                type: "string",
                title: "コマンドなしテンプレート",
                description: "ユーザーが実行可能なコマンドを持たないときに送信するチャットメッセージ。",
                tip: "変数: {username}",
                default: "{username} さんが実行できるコマンドはありません。",
                useTextArea: true
            },
            defaultTag: {
                type: "sort-tag-select",
                title: "デフォルトタグ",
                description: "プロフィールページを開いたときに初期選択されるコマンドタグ。",
                context: "commands"
            }
        }
    },
    onTriggerEvent: async (event) => {
        const { commandOptions } = event;

        const streamerName = await cloudSync.syncProfileData({
            username: event.chatMessage.username,
            userRoles: event.chatMessage.roles,
            profilePage: "commands"
        });

        let profileUrl = `https://firebot.app/profile/${streamerName}`;

        if (event.commandOptions?.defaultTag) {
            const commandTags = SortTagManager.getSortTagsForContext("commands");
            const defaultTag = commandTags.find(t => t.id === event.commandOptions?.defaultTag);
            if (defaultTag != null) {
                profileUrl += `?commands=${encodeURIComponent(defaultTag.name)}`;
            }
        }

        await TwitchApi.chat.sendChatMessage(commandOptions.successTemplate
            .replaceAll("{url}", profileUrl), null, true
        );
    }
};