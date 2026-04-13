import { SystemCommand } from "../../../../types/commands";
import { TwitchApi } from "../../../streaming-platforms/twitch/api";
import { TwitchSlashCommandHelpers } from "../../../streaming-platforms/twitch/chat/slash-commands/twitch-command-helpers";
import raidMessageChecker from "../../moderation/raid-message-checker";

/**
 * The `!spamraidprotection` command
 */
export const SpamRaidProtectionSystemCommand: SystemCommand<{
    displayTemplate: string;
    enableFollowerOnly: boolean;
    enableFollowerOnlyDuration: string;
    enableEmoteOnly: boolean;
    enableSubscriberOnly: boolean;
    enableSlowMode: boolean;
    enableSlowModeDelay: number;
    clearChat: boolean;
    blockRaiders: boolean;
    banRaiders: boolean;
}> = {
    definition: {
        id: "firebot:spamRaidProtection",
        name: "スパムレイド対策",
        active: true,
        hidden: false,
        trigger: "!spamraidprotection",
        description: "フォロワー限定やスローモードなどの保護機能を切り替えます。",
        autoDeleteTrigger: false,
        scanWholeMessage: false,
        cooldown: {
            user: 0,
            global: 30
        },
        restrictionData: {
            restrictions: [
                {
                    id: "sys-cmd-mods-only-perms",
                    type: "firebot:permissions",
                    mode: "roles",
                    roleIds: [
                        "broadcaster",
                        "mod"
                    ]
                }
            ]
        },
        options: {
            displayTemplate: {
                type: "string",
                title: "出力テンプレート",
                description: "現在の状況をユーザーに伝えるメッセージ。",
                default: `現在スパムレイドを受けているため、一時的に保護機能を有効にしています。`,
                useTextArea: true
            },
            enableFollowerOnly: {
                type: "boolean",
                title: "フォロワー限定モード",
                description: "フォロー期間に応じてチャットをフォロワーのみに制限します。",
                default: false
            },
            enableFollowerOnlyDuration: {
                type: "string",
                title: "フォロワー限定期間（形式: 1m / 1h / 1d / 1w / 1mo）",
                description: "フォロー期間に応じてチャットをフォロワーのみに制限します。",
                default: "15m"
            },
            enableEmoteOnly: {
                type: "boolean",
                title: "エモートのみモード",
                description: "チャットで Twitch エモートのみ送信可能にします。",
                default: false
            },
            enableSubscriberOnly: {
                type: "boolean",
                title: "サブスクライバー限定モード",
                description: "チャンネル登録者のみチャット可能にします。",
                default: false
            },
            enableSlowMode: {
                type: "boolean",
                title: "スローモード",
                description: "一定秒数ごとに 1 件だけチャットできるようにします。",
                default: false
            },
            enableSlowModeDelay: {
                type: "number",
                title: "スローモード秒数",
                description: "一定秒数ごとに 1 件だけチャットできるようにします。",
                default: 30
            },
            clearChat: {
                type: "boolean",
                title: "チャットをクリア",
                description: "チャットをクリアします。",
                default: true
            },
            blockRaiders: {
                type: "boolean",
                title: "レイダーをブロック",
                description: "レイドメッセージを投稿した全ユーザーをブロックします。",
                default: true
            },
            banRaiders: {
                type: "boolean",
                title: "レイダーをBAN",
                description: "レイドメッセージを投稿した全ユーザーをチャンネルからBANします。",
                default: true
            }
        },
        subCommands: [
            {
                arg: "off",
                usage: "off",
                description: "保護機能をオフにします。",
                restrictionData: {
                    restrictions: [
                        {
                            id: "sys-cmd-mods-only-perms",
                            type: "firebot:permissions",
                            mode: "roles",
                            roleIds: [
                                "broadcaster",
                                "mod"
                            ]
                        }
                    ]
                }
            }
        ]
    },
    onTriggerEvent: async (event) => {
        const { commandOptions } = event;
        const args = event.userCommand.args;

        if (args.length === 0) {
            if (commandOptions.enableFollowerOnly) {
                const duration = TwitchSlashCommandHelpers.getRawDurationInSeconds(commandOptions.enableFollowerOnlyDuration);
                await TwitchApi.chat.setFollowerOnlyMode(true, duration);
            }

            if (commandOptions.enableSubscriberOnly) {
                await TwitchApi.chat.setSubscriberOnlyMode(true);
            }

            if (commandOptions.enableEmoteOnly) {
                await TwitchApi.chat.setEmoteOnlyMode(true);
            }

            if (commandOptions.enableSlowMode) {
                await TwitchApi.chat.setSlowMode(true, commandOptions.enableSlowModeDelay);
            }

            if (commandOptions.clearChat) {
                await TwitchApi.chat.clearChat();
            }

            if (commandOptions.banRaiders || commandOptions.blockRaiders) {
                await raidMessageChecker.enable(commandOptions.banRaiders, commandOptions.blockRaiders);
            }

            await TwitchApi.chat.sendChatMessage(commandOptions.displayTemplate, null, true);
        }

        if (args[0] === "off") {
            await TwitchApi.chat.setFollowerOnlyMode(false);
            await TwitchApi.chat.setSubscriberOnlyMode(false);
            await TwitchApi.chat.setEmoteOnlyMode(false);
            await TwitchApi.chat.setSlowMode(false);

            raidMessageChecker.disable();

            await TwitchApi.chat.sendChatMessage("保護機能をオフにしました。", null, true);
        }
    }
};