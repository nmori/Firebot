"use strict";

const twitchApi = require("../../../twitch-api/api");
const chat = require("../../twitch-chat");
const raidMessageChecker = require("../../moderation/raid-message-checker");

const spamRaidProtection = {
    definition: {
        id: "firebot:spamRaidProtection",
        name: "SPAM レイド 制限",
        active: true,
        hidden: false,
        trigger: "!spamraidprotection",
        description: "フォロー限定モード、スローモードなどの保護手段へ切り替える.",
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
                description: "何が起こっているかをユーザーに伝えるメッセージ",
                default: `現在SPAMが来たため、一時的に保護手段をONにしています。`,
                useTextArea: true
            },
            enableFollowerOnly: {
                type: "boolean",
                title: "フォロワー限定モード",
                description: "フォロワーのフォロー期間（0分～3ヶ月）に基づいて、フォロワーの全員または一部にチャットを制限することができます。.",
                default: false
            },
            enableFollowerOnlyDuration: {
                type: "string",
                title: "フォロワーのみモード時間(フォーマット: 1m / 1h / 1d / 1w / 1mo)",
                description: "フォロー期間（0分～3ヶ月）に応じて、フォロワー全員または一部にチャットを制限することができます。",
                default: "15m"
            },
            enableEmoteOnly: {
                type: "boolean",
                title: "エモート専用モード",
                description: "チャットはTwitchのエモートでのみ可能",
                default: false
            },
            enableSubscriberOnly: {
                type: "boolean",
                title: "チャンネル登録者専用モード",
                description: "チャンネル登録者のみがチャットを許可されます。.",
                default: false
            },
            enableSlowMode: {
                type: "boolean",
                title: "スローモード",
                description: "スローモードでは、ユーザーは n秒に1回しかチャットメッセージを投稿できません",
                default: false
            },
            enableSlowModeDelay: {
                type: "number",
                title: "スローモードの遅延時間(秒)",
                description: "スローモードでは、ユーザーは n秒に1回しかチャットメッセージを投稿できません",
                default: 30
            },
            clearChat: {
                type: "boolean",
                title: "チャットをクリア",
                description: "チャットをクリアします",
                default: true
            },
            blockRaiders: {
                type: "boolean",
                title: "Raidした人をブロック",
                description: "Raid メッセージを投稿したすべてのユーザーをブロックします",
                default: true
            },
            banRaiders: {
                type: "boolean",
                title: "Raidした人を追放(BAN)する",
                description: "襲撃メッセージを投稿したすべてのユーザーをチャンネルから追放(BAN)します",
                default: true
            }
        },
        subCommands: [
            {
                arg: "off",
                usage: "off",
                description: "保護コマンドをOFFにします",
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
    /**
     * When the command is triggered
     */
    onTriggerEvent: async event => {
        const { commandOptions } = event;
        const args = event.userCommand.args;

        if (args.length === 0) {
            if (commandOptions.enableFollowerOnly) {
                await twitchApi.chat.setFollowerOnlyMode(true, commandOptions.enableFollowerOnlyDuration);
            }

            if (commandOptions.enableSubscriberOnly) {
                await twitchApi.chat.setSubscriberOnlyMode(true);
            }

            if (commandOptions.enableEmoteOnly) {
                await twitchApi.chat.setEmoteOnlyMode(true);
            }

            if (commandOptions.enableSlowMode) {
                await twitchApi.chat.setSlowMode(true, commandOptions.enableSlowModeDelay);
            }

            if (commandOptions.clearChat) {
                await twitchApi.chat.clearChat();
            }

            if (commandOptions.banRaiders || commandOptions.blockRaiders) {
                await raidMessageChecker.enable(commandOptions.banRaiders, commandOptions.blockRaiders);
            }

            await chat.sendChatMessage(commandOptions.displayTemplate);
        }

        if (args[0] === "off") {
            await twitchApi.chat.setFollowerOnlyMode(false);
            await twitchApi.chat.setSubscriberOnlyMode(false);
            await twitchApi.chat.setEmoteOnlyMode(false);
            await twitchApi.chat.setSlowMode(false);

            raidMessageChecker.disable();

            await chat.sendChatMessage("保護機能をOFFにしました.");
        }
    }
};

module.exports = spamRaidProtection;